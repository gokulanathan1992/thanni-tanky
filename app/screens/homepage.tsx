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
    motorStatusRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    text: {
        color: Colors.text,
        fontSize: 20,
        marginBottom: 10,
    },
    timerSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    timerLabel: {
        color: Colors.text,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    }
});

const Homepage = () => {
    const [state, setState] = React.useState({
        motorStatus: false,
        waterLevel: 0,
        motorTimer: 0,
    });
    const { motorStatus, waterLevel, motorTimer } = state;

    React.useEffect(() => {
        const dbRef = ref(database);
        const unsubscribe = onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            setState({
                motorStatus: data?.isMotorOn,
                waterLevel: data?.waterLevel,
                motorTimer: data?.motorTimer,
            });
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return (
        <View style={styles.container} >
            <WaterTank waterLevel={waterLevel} />
            <View style={styles.motorStatusRow}>
                <Text style={styles.text}>{'Motor Status'}</Text>
                <Switch
                    value={motorStatus}
                    onValueChange={() => {}}
                    disabled={true}
                    trackColor={{ false: '#767577', true: Colors.water }}
                    thumbColor={motorStatus ? Colors.waterLight : '#f4f3f4'}
                />
            </View>
            <View style={styles.timerSection}>
                <CircularTimer timer={motorTimer} />
                <Text style={styles.timerLabel}>{'Motor Timer'}</Text>
            </View>
        </View>
    );
};

export default Homepage;
