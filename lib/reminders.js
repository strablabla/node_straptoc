/*

Calendar Reminders System

Checks for upcoming events and sends notifications

*/

var fs = require('fs')
var yaml = require('js-yaml')
var nodemailer = require('nodemailer')

var reminderCheckInterval = null
var emailTransporter = null

// Initialize email transporter based on config
function initEmailTransporter(config) {
    if (!config.email_enabled) {
        emailTransporter = null
        return
    }

    var transportConfig = {}

    if (config.email_service === 'gmail') {
        transportConfig = {
            service: 'gmail',
            auth: {
                user: config.email_user,
                pass: config.email_password
            }
        }
    } else if (config.email_service === 'outlook') {
        transportConfig = {
            service: 'outlook',
            auth: {
                user: config.email_user,
                pass: config.email_password
            }
        }
    } else if (config.email_service === 'yahoo') {
        transportConfig = {
            service: 'yahoo',
            auth: {
                user: config.email_user,
                pass: config.email_password
            }
        }
    }

    try {
        emailTransporter = nodemailer.createTransporter(transportConfig)
        console.log('[Reminders] Email transporter initialized')
    } catch(e) {
        console.error('[Reminders] Error initializing email transporter:', e)
        emailTransporter = null
    }
}

// Send email reminder
function sendEmailReminder(to, subject, text) {
    if (!emailTransporter) {
        console.log('[Reminders] Email not configured, skipping email send')
        return
    }

    var mailOptions = {
        from: emailTransporter.options.auth.user,
        to: to,
        subject: subject,
        text: text
    }

    emailTransporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.error('[Reminders] Error sending email:', error)
        } else {
            console.log('[Reminders] Email sent:', info.response)
        }
    })
}

// Parse time from note text (format: HH:MM or H:MM)
function parseTimeFromNote(noteText) {
    var timePattern = /^(\d{1,2}):(\d{2})/
    var match = noteText.match(timePattern)
    if (match) {
        return {
            hours: parseInt(match[1]),
            minutes: parseInt(match[2]),
            fullMatch: match[0]
        }
    }
    return null
}

// Check if event should trigger reminder
function shouldNotify(eventDate, eventTime, notifyBeforeMinutes) {
    var now = new Date()
    var eventDateTime = new Date(eventDate)

    if (eventTime) {
        eventDateTime.setHours(eventTime.hours, eventTime.minutes, 0, 0)
    } else {
        // For all-day events, notify at 9 AM on the day
        eventDateTime.setHours(9, 0, 0, 0)
    }

    var timeDiff = eventDateTime.getTime() - now.getTime()
    var minutesDiff = Math.floor(timeDiff / 60000)

    // Notify if we're within the notification window
    // (between notifyBeforeMinutes and 0 minutes before event)
    return minutesDiff > 0 && minutesDiff <= notifyBeforeMinutes
}

// Format date key (YYYY_MM_DD) to readable date
function formatDate(dateKey) {
    var parts = dateKey.split('_')
    var year = '20' + parts[0]
    var month = parts[1]
    var day = parts[2]
    return day + '/' + month + '/' + year
}

// Check for upcoming events and send notifications
function checkReminders(io) {
    console.log('[Reminders] Checking for upcoming events...')

    // Load config
    fs.readFile('static/config.yaml', 'utf8', function (err, configText) {
        if (err) {
            console.error('[Reminders] Error reading config:', err)
            return
        }

        var config
        try {
            config = yaml.load(configText)
        } catch(e) {
            console.error('[Reminders] Error parsing config:', e)
            return
        }

        var remindersConfig = config.reminders || {}
        var notifyBefore = remindersConfig.notification_minutes_before || 30

        // Load agenda
        fs.readFile('static/agenda.yaml', 'utf8', function (err, agendaText) {
            if (err) {
                // No agenda file yet, nothing to check
                return
            }

            var agenda
            try {
                agenda = yaml.load(agendaText) || {}
            } catch(e) {
                console.error('[Reminders] Error parsing agenda:', e)
                return
            }

            var now = new Date()
            var notifications = []

            // Check each date in agenda
            Object.keys(agenda).forEach(function(dateKey) {
                var notes = agenda[dateKey]

                // Parse date from key (format: YY_MM_DD or YYYY_MM_DD)
                var parts = dateKey.split('_')
                var year = parts[0].length === 2 ? '20' + parts[0] : parts[0]
                var month = parseInt(parts[1]) - 1 // Month is 0-indexed
                var day = parseInt(parts[2])
                var eventDate = new Date(year, month, day)

                notes.forEach(function(note) {
                    var timeInfo = parseTimeFromNote(note.text)

                    if (shouldNotify(eventDate, timeInfo, notifyBefore)) {
                        var notification = {
                            dateKey: dateKey,
                            date: formatDate(dateKey),
                            text: note.text,
                            time: timeInfo ? timeInfo.fullMatch : null,
                            isAlert: note.alert || false
                        }
                        notifications.push(notification)
                        console.log('[Reminders] Found upcoming event:', notification)
                    }
                })
            })

            // Send notifications to all clients
            if (notifications.length > 0) {
                console.log('[Reminders] Sending', notifications.length, 'notification(s) to clients')
                io.sockets.emit('show_reminders', JSON.stringify(notifications))

                // Send email if enabled
                if (remindersConfig.email_enabled && remindersConfig.email_address) {
                    notifications.forEach(function(notif) {
                        var subject = 'Reminder: Event on ' + notif.date
                        var text = 'You have an upcoming event:\n\n' +
                                   notif.text + '\n\n' +
                                   'Date: ' + notif.date
                        sendEmailReminder(remindersConfig.email_address, subject, text)
                    })
                }
            }
        })
    })
}

// Start reminder checking system
exports.start = function(io) {
    console.log('[Reminders] Starting reminder system...')

    // Load initial config
    fs.readFile('static/config.yaml', 'utf8', function (err, text) {
        if (err) {
            console.error('[Reminders] Error reading config:', err)
            return
        }

        var config
        try {
            config = yaml.load(text)
        } catch(e) {
            console.error('[Reminders] Error parsing config:', e)
            return
        }

        var remindersConfig = config.reminders || {}
        var checkInterval = (remindersConfig.check_interval_minutes || 5) * 60 * 1000

        // Initialize email if enabled
        initEmailTransporter(remindersConfig)

        // Start checking
        checkReminders(io) // Check immediately on start
        reminderCheckInterval = setInterval(function() {
            checkReminders(io)
        }, checkInterval)

        console.log('[Reminders] Checking every', checkInterval / 60000, 'minutes')
    })
}

// Restart reminder system with new config
exports.restart = function(io, newConfig) {
    console.log('[Reminders] Restarting with new configuration...')

    // Stop existing interval
    if (reminderCheckInterval) {
        clearInterval(reminderCheckInterval)
    }

    // Reinitialize email transporter
    initEmailTransporter(newConfig)

    // Start new interval
    var checkInterval = (newConfig.check_interval_minutes || 5) * 60 * 1000
    checkReminders(io) // Check immediately
    reminderCheckInterval = setInterval(function() {
        checkReminders(io)
    }, checkInterval)

    console.log('[Reminders] Restart complete, checking every', checkInterval / 60000, 'minutes')
}
