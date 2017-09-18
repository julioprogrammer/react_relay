function timeDifference(current, previous) {

    const milliSecondsPerMinute = 60 * 1000
    const milliSecondsPerHour = milliSecondsPerMinute * 60
    const milliSecondsPerDay = milliSecondsPerHour * 24
    const milliSecondsPerMonth = milliSecondsPerDay * 30
    const milliSecondsPerYear = milliSecondsPerDay * 365

    const elapsed = current - previous

    if (elapsed < milliSecondsPerMinute / 3) {
        return 'just now'
    }

    if (elapsed < milliSecondsPerMinute) {
        return 'less than 1 min ago'
    }

    else if (elapsed < milliSecondsPerHour) {
        return Math.round(elapsed / milliSecondsPerMinute) + ' min ago'
    }

    else if (elapsed < milliSecondsPerDay) {
        return Math.round(elapsed / milliSecondsPerHour) + ' h ago'
    }

    else if (elapsed < milliSecondsPerMonth) {
        return Math.round(elapsed / milliSecondsPerDay) + ' days ago'
    }

    else if (elapsed < milliSecondsPerYear) {
        return Math.round(elapsed / milliSecondsPerMonth) + ' mo ago'
    }

    else {
        return Math.round(elapsed / milliSecondsPerYear) + ' years ago'
    }
}

export function timeDifferenceForDate(date) {
    const now = new Date().getTime()
    const updated = new Date(date).getTime()
    return timeDifference(now, updated)
}

export function requestAPI(operation, variables, GC_AUTH_TOKEN) {
    return fetch('https://api.graph.cool/relay/v1/cj7nivq5z0mph0122v4r35u00', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem(GC_AUTH_TOKEN)}`
        },
        body: JSON.stringify({
            query: operation.text,
            variables,
        }),
    }).then(response => {
        return response.json()
    })
}