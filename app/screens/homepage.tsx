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
        justifyContent: 'center',
        padding: 20,
        width: '100%',
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 20,
        marginBottom: 12,
        marginTop: 12,
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

    React.useEffect(() => {
        const dbRef = ref(database);
        const unsubscribe = onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            setState({
                distance: data?.distance,
                onlineStatus: data?.onlineStatus,
                motorStatus: data?.isMotorOn,
                motorTimer: data?.motorTimer,
                waterLevel: data?.waterLevel,
            });
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return (
        <View style={styles.container} >
            <WaterTank waterLevel={waterLevel} />
            <View style={styles.row}>
                <View style={styles.statusRow}>
                    <Text style={styles.text}>{'Online Status'}</Text>
                    <Switch
                        value={motorStatus}
                        onValueChange={() => {}}
                        disabled={true}
                        trackColor={{ false: Colors.offline, true: Colors.online }}
                        thumbColor={onlineStatus ? Colors.waterLight : '#f4f3f4'}
                    />
                </View>
                <View style={styles.statusRow}>
                    <Text style={styles.text}>{'Motor Status'}</Text>
                    <Switch
                        value={motorStatus}
                        onValueChange={() => {}}
                        disabled={true}
                        trackColor={{ false: '#767577', true: Colors.water }}
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
    );
};

export default Homepage;
