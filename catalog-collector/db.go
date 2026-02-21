package main

import "time"

func main() {
    db := connectDB()
    client := connectTMDB()

    run(db, client) // run once immediately on startup

    ticker := time.NewTicker(6 * time.Hour)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            run(db, client)
        case <-ctx.Done():
            return
        }
    }
}
