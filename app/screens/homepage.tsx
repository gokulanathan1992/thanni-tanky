import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { onValue, ref } from 'firebase/database';
import React from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { database } from '../../firebase';
import Colors from '../colors';
import CircularTimer from '../components/CircularTimer';
import WaterTank from '../components/WaterTank';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: Colors.appBg,
        flex: 1,
        padding: 16,
        paddingBottom: 36,
        paddingTop: 36,
        width: '100%',
    },
    contentSection: {
        flex: 1,
        marginBottom: 8,
        marginTop: 8,
        width: '100%',
    },
    headerSection: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginBottom: 8,
        marginTop: 8,
        position: 'sticky',
        width: '100%',
    },
    headerStatusOffline: {
        backgroundColor: Colors.offline,
    },
    headerStatusOnline: {
        backgroundColor: Colors.water,
    },
    headerStatusSection: {
        alignItems: 'center',
        borderRadius: 32,
        padding: 12,
    },
    headerSubtext: {
        color: Colors.offline,
        fontSize: 12,
        fontWeight: '400',
    },
    headerTextContainer: {
        flexDirection: 'column',
        gap: 2,
    },
    headerTextSection: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
        maxWidth: '70%',
    },
    headerText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '800',
    },
    logo: {
        borderRadius: 12,
        height: 56,
        resizeMode: 'contain',
        width: 56,
    },
    infoRow: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: 4,
        width: '100%',
    },
    motorStatusOffline: {
        backgroundColor: Colors.offline,
    },
    motorStatusOnline: {
        backgroundColor: Colors.water,
    },
    motorStatusSection: {
        alignItems: 'center',
        borderRadius: 16,
        marginBottom: -8,
        marginTop: -8,
        padding: 8,
    },
    noteContainer: {
        alignItems: 'flex-start',
        flexDirection: 'column',
    },
    noteItem: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: 8,
    },
    section: {
        alignItems: 'flex-start',
        backgroundColor: Colors.sectionBg,
        borderRadius: 12,
        flexDirection: 'column',
        gap: 8,
        marginBottom: 8,
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        width: '100%',
    },
    sectionRow: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '100%',
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
        alignSelf: 'center',
        marginTop: 4,
    },
    waterTankSection: {
        alignSelf: 'center',
        marginTop: 4,
    },
});

const Homepage = () => {
    const [state, setState] = React.useState({
        distance: 0,
        onlineStatus: false,
        motorStatus: false,
        motorTimer: 0,
        showHelp: false,
        waterLevel: 0,
    });
    const { distance, onlineStatus, motorStatus, motorTimer, showHelp, waterLevel } = state;

    // Track previous value and timeout for heartbeat detection
    const lastHeartbeatValueRef = React.useRef<boolean | null>(null);
    const heartbeatTimeoutRef = React.useRef<number | null>(null);

    // Animated values for help section
    const helpAnimation = React.useRef(new Animated.Value(0)).current;
    const arrowRotation = React.useRef(new Animated.Value(0)).current;

    // Toggle help section
    const toggleHelp = () => {
        setState((prevState) => ({
            ...prevState,
            showHelp: !prevState.showHelp,
        }));
    };

    // Animate help section when showHelp changes
    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(helpAnimation, {
                toValue: showHelp ? 1 : 0,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(arrowRotation, {
                toValue: showHelp ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [showHelp, helpAnimation, arrowRotation]);

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
                showHelp: prevState.showHelp,
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
        <View style={styles.container}>
            <View style={styles.headerSection}>
                <View style={styles.headerTextSection}>
                    <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerText}>{'Thanni Tanky'}</Text>
                        <Text style={styles.headerSubtext}>{'Water Tank Monitoring System'}</Text>
                    </View>
                </View>
                <View style={[
                    styles.headerStatusSection,
                    onlineStatus ? styles.headerStatusOnline : styles.headerStatusOffline
                ]}>
                    <MaterialIcons name='power-settings-new' size={24} color={onlineStatus ? Colors.text : Colors.appBg} />
                </View>
            </View>
            <ScrollView  style={styles.contentSection} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.textBold}>{'Water Level'}</Text>
                    <View style={styles.waterTankSection}>
                        <WaterTank waterLevel={waterLevel} />
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialIcons name='info' size={16} color={onlineStatus ? Colors.water : Colors.offline} />
                        <Text style={styles.text}>{`Current distance between sensor and water surface: ${distance} cm`}</Text>
                    </View>
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.textBold}>{'Motor Status'}</Text>
                        <View style={[
                            styles.motorStatusSection,
                            motorStatus ? styles.motorStatusOnline : styles.motorStatusOffline
                        ]}>
                            <MaterialIcons name='power-settings-new' size={16} color={motorStatus ? Colors.text : Colors.sectionBg} />
                        </View>
                    </View>
                </View>
                {motorStatus && (
                    <View style={styles.section}>
                        <Text style={styles.textBold}>{'Motor Timer'}</Text>
                        <View style={styles.timerSection}>
                            <CircularTimer timer={motorTimer} />
                        </View>
                    </View>
                )}
                <Animated.View style={[
                    styles.section,
                    {
                        gap: helpAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 8],
                        }),
                    },
                ]}>
                    <Pressable onPress={toggleHelp} style={styles.sectionRow}>
                        <Text style={styles.textBold}>{'Help'}</Text>
                        <View style={styles.motorStatusSection}>
                            <Animated.View
                                style={{
                                    transform: [{
                                        rotate: arrowRotation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '-180deg'],
                                        })
                                    }]
                                }}
                            >
                                <MaterialIcons name='keyboard-arrow-down' size={14} color={Colors.text} />
                            </Animated.View>
                        </View>
                    </Pressable>
                    <Animated.View 
                        style={[
                            styles.noteContainer,
                            {
                                maxHeight: helpAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 500],
                                }),
                                marginTop: helpAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 12],
                                }),
                                gap: helpAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 8],
                                }),
                                opacity: helpAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 1],
                                }),
                                overflow: 'hidden',
                            },
                        ]}
                    >
                        <View style={styles.noteItem}>
                            <Text style={styles.text}>{'•'}</Text>
                            <Text style={styles.text}>{'The motor turns ON when the water level goes below or equals 20%, runs for 20 minutes and then turns OFF.'}</Text>
                        </View>
                        <View style={styles.noteItem}>
                            <Text style={styles.text}>{'•'}</Text>
                            <Text style={styles.text}>{'The system remains OFF at night time between 11:00 PM and 5:00 AM local time.'}</Text>
                        </View>
                    </Animated.View>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

export default Homepage;
