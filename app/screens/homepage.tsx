import { onValue, ref } from "firebase/database";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { database } from "../../firebase";

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
        backgroundColor: 'gray',
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        width: '100%',
    },
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
            <Text>{`Motor Status: ${motorStatus ? 'ON' : 'OFF'}`}</Text>
            <Text>{`Tank Water Level: ${waterLevel}`}</Text>
            <Text>{`Motor Timer: ${motorTimer}`}</Text>
        </View>
    );
};

export default Homepage;
