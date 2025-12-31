import { onValue, ref } from 'firebase/database';
import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { database } from '../../firebase';
import Colors from '../colors';
import CircularTimer from '../components/CircularTimer';
import WaterTank from '../components/WaterTank';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: Colors.appBg,
        flex: 1,
        width: '100%',
    },
    content: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        width: '100%',
    },
    footer: {
        backgroundColor: Colors.appBg,
        borderTopColor: Colors.tankBorder,
        borderTopWidth: 1,
        paddingBottom: 20,
        paddingTop: 16,
        width: '100%',
    },
    noteContainer: {
        alignItems: 'flex-start',
        flexDirection: 'column',
        gap: 8,
        paddingHorizontal: 20,
    },
    noteItem: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: 8,
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 20,
        marginBottom: 8,
        marginTop: 8,
    },
    statusRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
    },
    text: {
        color: Colors.text,
        fontSize: 14,
    },
    textBold: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    timerSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    timerLabel: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 8,
    }
});

const Homepage = () => {
    const [state, setState] = React.useState({
        distance: 0,
        onlineStatus: false,
        motorStatus: false,
        motorTimer: 0,
        waterLevel: 0,
    });
    const { distance, onlineStatus, motorStatus, motorTimer, waterLevel } = state;

    // Track previous value and timeout for heartbeat detection
    const lastHeartbeatValueRef = React.useRef<boolean | null>(null);
    const heartbeatTimeoutRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        const dbRef = ref(database);
        const unsubscribe = onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            const currentHeartbeat = data?.onlineStatus;

            // Check if the value has toggled (changed from previous value)
            const hasToggled = lastHeartbeatValueRef.current !== null && 
                              lastHeartbeatValueRef.current !== currentHeartbeat;

            // Update the last value
            lastHeartbeatValueRef.current = currentHeartbeat;

            // Update other fields
            setState((prevState) => ({
                distance: data?.distance,
                onlineStatus: hasToggled ? true : prevState.onlineStatus, // Set true only on toggle
                motorStatus: data?.isMotorOn,
                motorTimer: data?.motorTimer,
                waterLevel: data?.waterLevel,
            }));

            // If there's a toggle, reset the timeout
            if (hasToggled) {
                // Clear existing timeout
                if (heartbeatTimeoutRef.current) {
                    clearTimeout(heartbeatTimeoutRef.current);
                }

                // Set new timeout - if no toggle for 10 seconds, mark as offline
                heartbeatTimeoutRef.current = setTimeout(() => {
                    setState((prevState) => ({
                        ...prevState,
                        onlineStatus: false,
                    }));
                    heartbeatTimeoutRef.current = null;
                }, 10000);
            }
        });

        // Cleanup subscription and timeout on unmount
        return () => {
            unsubscribe();
            if (heartbeatTimeoutRef.current) {
                clearTimeout(heartbeatTimeoutRef.current);
            }
        };
    }, []);

    return (
        <View style={styles.container} >
            <View style={styles.content}>
                <WaterTank waterLevel={waterLevel} />
                <View style={styles.row}>
                    <View style={styles.statusRow}>
                        <Text style={styles.text}>{'Online Status'}</Text>
                        <Switch
                            value={onlineStatus}
                            onValueChange={() => {}}
                            disabled={true}
                            trackColor={{ false: Colors.offline, true: Colors.water }}
                            thumbColor={onlineStatus ? Colors.waterLight : '#f4f3f4'}
                        />
                    </View>
                    <View style={styles.statusRow}>
                        <Text style={styles.text}>{'Motor Status'}</Text>
                        <Switch
                            value={motorStatus}
                            onValueChange={() => {}}
                            disabled={true}
                            trackColor={{ false: Colors.offline, true: Colors.water }}
                            thumbColor={motorStatus ? Colors.waterLight : '#f4f3f4'}
                        />
                    </View>
                </View>
                <Text style={styles.text}>{`Distance between sensor and water surface: ${distance} cm`}</Text>
                {motorStatus && (
                    <View style={styles.timerSection}>
                        <CircularTimer timer={motorTimer} />
                        <Text style={styles.timerLabel}>{'Motor Timer'}</Text>
                    </View>
                )}
            </View>
            <View style={styles.footer}>
                <View style={styles.noteContainer}>
                    <Text style={styles.textBold}>{'Note:'}</Text>
                    <View style={styles.noteItem}>
                        <Text style={styles.text}>{'•'}</Text>
                        <Text style={styles.text}>{'The motor turns ON when the water level goes below or equals 20%, runs for 20 minutes and then turns OFF.'}</Text>
                    </View>
                    <View style={styles.noteItem}>
                        <Text style={styles.text}>{'•'}</Text>
                        <Text style={styles.text}>{'The system remains OFF at night time between 11:00 PM and 5:00 AM local time.'}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default Homepage;
