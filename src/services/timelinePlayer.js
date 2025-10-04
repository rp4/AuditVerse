/**
 * Timeline Player Module
 * Handles playback of historical data snapshots for temporal visualization
 */

export class TimelinePlayer {
    constructor(snapshotsData, onSnapshotChange) {
        this.snapshots = snapshotsData?.snapshots || [];
        this.currentIndex = 0; // Start at first snapshot (beginning of timeline)
        this.isPlaying = false;
        this.playInterval = null;
        this.playbackSpeed = 2000; // 2 seconds per snapshot (slower for visibility)
        this.onSnapshotChange = onSnapshotChange;
        this.keyEvents = snapshotsData?.keyEvents || [];
    }

    /**
     * Get current snapshot
     */
    getCurrentSnapshot() {
        if (this.currentIndex < 0 || this.currentIndex >= this.snapshots.length) {
            return null;
        }
        return this.snapshots[this.currentIndex];
    }

    /**
     * Get snapshot at specific index
     */
    getSnapshot(index) {
        if (index < 0 || index >= this.snapshots.length) {
            return null;
        }
        return this.snapshots[index];
    }

    /**
     * Move to next snapshot
     */
    next() {
        if (this.currentIndex < this.snapshots.length - 1) {
            this.currentIndex++;
            console.log(`[TIMELINE] Advanced to snapshot ${this.currentIndex + 1} of ${this.snapshots.length}`);
            this.notifyChange();
            return true;
        }
        console.log(`[TIMELINE] Already at last snapshot (${this.snapshots.length}), cannot advance`);
        return false;
    }

    /**
     * Move to previous snapshot
     */
    previous() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.notifyChange();
            return true;
        }
        return false;
    }

    /**
     * Jump to specific snapshot index
     */
    jumpTo(index) {
        if (index >= 0 && index < this.snapshots.length) {
            this.currentIndex = index;
            this.notifyChange();
            return true;
        }
        return false;
    }

    /**
     * Jump to most recent snapshot
     */
    jumpToLatest() {
        this.currentIndex = this.snapshots.length - 1;
        this.notifyChange();
    }

    /**
     * Jump to first snapshot
     */
    jumpToFirst() {
        this.currentIndex = 0;
        this.notifyChange();
    }

    /**
     * Start playback
     */
    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;

        // If at the end, reset to beginning
        if (this.currentIndex >= this.snapshots.length - 1) {
            this.currentIndex = 0;
        }

        // Show the current snapshot first
        this.notifyChange();

        // Then start interval to advance through remaining snapshots
        this.playInterval = setInterval(() => {
            const hasNext = this.next();
            if (!hasNext) {
                this.pause();
                console.log('[TIMELINE] Playback complete - reached last snapshot');
            }
        }, this.playbackSpeed);
    }

    /**
     * Pause playback
     */
    pause() {
        this.isPlaying = false;
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
    }

    /**
     * Reset to beginning
     */
    reset() {
        this.pause();
        this.jumpToFirst();
    }

    /**
     * Set playback speed
     */
    setSpeed(speed) {
        this.playbackSpeed = speed;
        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    }

    /**
     * Notify listeners of snapshot change
     */
    notifyChange() {
        if (this.onSnapshotChange) {
            const snapshot = this.getCurrentSnapshot();
            const events = this.getEventsForSnapshot(snapshot);
            this.onSnapshotChange(snapshot, this.currentIndex, events);
        }
    }

    /**
     * Get events that occurred during this snapshot period
     */
    getEventsForSnapshot(snapshot) {
        if (!snapshot || !this.keyEvents) return [];

        const snapshotDate = new Date(snapshot.date);

        // Get next snapshot date or use current + 1 month as end range
        const nextSnapshot = this.snapshots[this.currentIndex + 1];
        const endDate = nextSnapshot
            ? new Date(nextSnapshot.date)
            : new Date(snapshotDate.getFullYear(), snapshotDate.getMonth() + 1, 1);

        return this.keyEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= snapshotDate && eventDate < endDate;
        });
    }

    /**
     * Apply snapshot changes to base data
     */
    applySnapshotToData(baseData, snapshot) {
        if (!snapshot || !baseData) return baseData;

        const updatedData = JSON.parse(JSON.stringify(baseData)); // Deep clone

        // Apply risk changes
        if (snapshot.riskChanges) {
            snapshot.riskChanges.forEach(change => {
                const risk = updatedData.risks?.find(r => r.id === change.id);
                if (risk) {
                    if (change.residual_rating !== undefined) {
                        risk.residual_rating = change.residual_rating;
                    }
                    if (change.trend !== undefined) {
                        risk.trend = change.trend;
                    }
                }
            });
        }

        // Apply control changes
        if (snapshot.controlChanges) {
            snapshot.controlChanges.forEach(change => {
                const control = updatedData.controls?.find(c => c.id === change.id);
                if (control && change.status) {
                    control.status = change.status;
                    if (change.effectiveness_score !== undefined) {
                        control.effectiveness_score = change.effectiveness_score;
                    }
                    if (change.test_result !== undefined) {
                        control.test_result = change.test_result;
                    }
                }
            });
        }

        // Apply issue changes - add new issues as they appear
        if (snapshot.issueChanges) {
            snapshot.issueChanges.forEach(change => {
                const existingIssue = updatedData.issues?.find(i => i.id === change.id);
                if (existingIssue) {
                    if (change.status !== undefined) {
                        existingIssue.status = change.status;
                    }
                } else if (change.status === 'open') {
                    // Issue newly identified in this period
                    const fullIssue = baseData.issues?.find(i => i.id === change.id);
                    if (fullIssue && updatedData.issues) {
                        updatedData.issues.push({
                            ...fullIssue,
                            status: change.status,
                            severity: change.severity
                        });
                    }
                }
            });

            // Remove closed issues if they weren't in base data
            if (updatedData.issues) {
                updatedData.issues = updatedData.issues.filter(issue => {
                    const change = snapshot.issueChanges.find(c => c.id === issue.id);
                    return !change || change.status !== 'closed' || issue.status !== 'closed';
                });
            }
        }

        // Apply incident changes - add incidents as they occur
        if (snapshot.incidentChanges && updatedData.incidents) {
            snapshot.incidentChanges.forEach(change => {
                const fullIncident = baseData.incidents?.find(i => i.id === change.id);
                if (fullIncident) {
                    const exists = updatedData.incidents.some(i => i.id === change.id);
                    if (!exists) {
                        updatedData.incidents.push({
                            ...fullIncident,
                            severity: change.severity
                        });
                    }
                }
            });
        }

        // Apply audit changes
        if (snapshot.auditChanges) {
            snapshot.auditChanges.forEach(change => {
                const audit = updatedData.audits?.find(a => a.id === change.id);
                if (audit) {
                    if (change.status !== undefined) {
                        audit.status = change.status;
                    }
                    if (change.findings !== undefined) {
                        audit.findings = change.findings;
                    }
                    if (change.critical_findings !== undefined) {
                        audit.critical_findings = change.critical_findings;
                    }
                }
            });
        }

        return updatedData;
    }

    /**
     * Get summary statistics for current snapshot
     */
    getCurrentStats() {
        const snapshot = this.getCurrentSnapshot();
        if (!snapshot) return null;

        return {
            date: snapshot.date,
            month: snapshot.month,
            summary: snapshot.summary,
            riskChanges: snapshot.riskChanges?.length || 0,
            issueChanges: snapshot.issueChanges?.length || 0,
            incidentChanges: snapshot.incidentChanges?.length || 0,
            auditChanges: snapshot.auditChanges?.length || 0,
            totalChanges: (snapshot.riskChanges?.length || 0) +
                         (snapshot.issueChanges?.length || 0) +
                         (snapshot.incidentChanges?.length || 0) +
                         (snapshot.auditChanges?.length || 0)
        };
    }

    /**
     * Get progress percentage
     */
    getProgress() {
        if (this.snapshots.length === 0) return 0;
        return (this.currentIndex / (this.snapshots.length - 1)) * 100;
    }

    /**
     * Get total number of snapshots
     */
    getSnapshotCount() {
        return this.snapshots.length;
    }

    /**
     * Check if playing
     */
    getIsPlaying() {
        return this.isPlaying;
    }
}

/**
 * Load historical snapshots data
 */
export async function loadHistoricalSnapshots() {
    try {
        const response = await fetch('./data/historicalSnapshots.json');
        if (!response.ok) {
            throw new Error(`Failed to load historical snapshots: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading historical snapshots:', error);
        return null;
    }
}
