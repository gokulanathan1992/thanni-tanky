import { onValue, ref } from 'firebase/database';
import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { database } from '../../firebase';
import Colors from '../colors';
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
    text: {
        color: Colors.text,
        fontSize: 20,
        marginBottom: 10,
    },
    motorStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
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
            <View style={styles.motorStatusRow}>
                <Text style={styles.text}>Motor Status:</Text>
                <Switch
                    value={motorStatus}
                    onValueChange={() => {}}
                    disabled={true}
                    trackColor={{ false: '#767577', true: Colors.water }}
                    thumbColor={motorStatus ? Colors.waterLight : '#f4f3f4'}
                />
            </View>
            <Text style={styles.text}>{`Motor Timer: ${motorTimer} min${motorTimer > 1 ? 's' : ''}`}</Text>
            <WaterTank waterLevel={waterLevel} />
        </View>
    );
};

export default Homepage;
