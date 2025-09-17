import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Dimensions,
    StatusBar,
    Platform,
    Vibration,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const QRScannerModal = ({ 
    visible, 
    onClose, 
    onQrScanned, 
    booking,
    title 
}) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [flashOn, setFlashOn] = useState(false);
    const [scannedData, setScannedData] = useState(null);

    // Request camera permission
    useEffect(() => {
        if (visible) {
            getCameraPermissions();
        } else {
            // Reset states when modal is closed
            resetStates();
        }
    }, [visible]);

    const getCameraPermissions = async () => {
        try {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
            
            if (status !== 'granted') {
                Alert.alert(
                    'Camera Permission Required',
                    'Please enable camera access to scan QR codes.',
                    [
                        { text: 'Cancel', onPress: onClose },
                        { text: 'OK', onPress: onClose }
                    ]
                );
            }
        } catch (error) {
            console.error('Permission request error:', error);
            setHasPermission(false);
            Alert.alert('Error', 'Failed to request camera permission');
        }
    };

    const resetStates = () => {
        setIsScanning(false);
        setScannedData(null);
        setFlashOn(false);
    };

    // Handle QR code scan
    const handleBarCodeScanned = ({ type, data }) => {
        if (isScanning || scannedData) return; // Prevent multiple scans
        
        setIsScanning(true);
        setScannedData(data);

        // Simple vibration feedback
        try {
            Vibration.vibrate(100);
        } catch (error) {
            console.log('Vibration not available');
        }

        // Process the scanned data after a short delay
        setTimeout(() => {
            onQrScanned(data);
            handleClose();
        }, 500);
    };

    // Close modal and reset states
    const handleClose = () => {
        resetStates();
        onClose();
    };

    // Toggle flashlight
    const toggleFlash = () => {
        setFlashOn(!flashOn);
    };

    // Demo scan for testing
    const handleDemoScan = () => {
        if (isScanning) return;
        
        const demoQrCode = `DEMO_QR_${booking?.id}_${Date.now()}`;
        handleBarCodeScanned({ type: 'qr', data: demoQrCode });
    };

    // Get scan instructions based on booking status
    const getScanInstructions = () => {
        const status = booking?.status?.toLowerCase();
        
        switch (status) {
            case 'confirmed':
                return {
                    title: 'Scan QR to Start Work',
                    instruction: 'Ask the worker to show their QR code to check in and start work',
                    icon: 'play-circle-filled'
                };
            case 'in_progress':
                return {
                    title: 'Scan QR to End Work',
                    instruction: 'Ask the worker to show their QR code to check out and complete work',
                    icon: 'stop-circle'
                };
            default:
                return {
                    title: 'Scan QR Code',
                    instruction: 'Position the QR code within the frame to scan',
                    icon: 'qr-code-scanner'
                };
        }
    };

    const scanInfo = getScanInstructions();

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={handleClose}
        >
            <StatusBar backgroundColor="#000" barStyle="light-content" />
            
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Icon name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>
                            {title || scanInfo.title}
                        </Text>
                    </View>

                    <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
                        <Icon 
                            name={flashOn ? "flash-on" : "flash-off"} 
                            size={24} 
                            color="#FFFFFF" 
                        />
                    </TouchableOpacity>
                </View>

                {/* Camera or Permission Content */}
                <View style={styles.cameraContainer}>
                    {hasPermission === null ? (
                        // Permission Loading
                        <View style={styles.centerContent}>
                            <ActivityIndicator size="large" color="#FFFFFF" />
                            <Text style={styles.permissionText}>Requesting camera access...</Text>
                        </View>
                    ) : hasPermission === false ? (
                        // Permission Denied
                        <View style={styles.centerContent}>
                            <Icon name="camera-alt" size={64} color="#666" />
                            <Text style={styles.permissionText}>Camera access required</Text>
                            <Text style={styles.permissionSubtext}>
                                Please enable camera permission in settings to scan QR codes
                            </Text>
                            <TouchableOpacity style={styles.permissionButton} onPress={handleClose}>
                                <Text style={styles.permissionButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Camera View
                        <>
                            <CameraView
                                style={styles.camera}
                                facing="back"
                                enableTorch={flashOn}
                                onBarcodeScanned={scannedData ? undefined : handleBarCodeScanned}
                                barcodeScannerSettings={{
                                    barcodeTypes: ['qr'],
                                }}
                            >
                                {/* Scanning Overlay */}
                                <View style={styles.overlay}>
                                    {/* Top Overlay */}
                                    <View style={styles.overlayTop} />
                                    
                                    {/* Middle Section with Scan Frame */}
                                    <View style={styles.overlayMiddle}>
                                        <View style={styles.overlaySide} />
                                        
                                        {/* Scan Frame */}
                                        <View style={styles.scanFrame}>
                                            {/* Corner Indicators */}
                                            <View style={[styles.corner, styles.cornerTopLeft]} />
                                            <View style={[styles.corner, styles.cornerTopRight]} />
                                            <View style={[styles.corner, styles.cornerBottomLeft]} />
                                            <View style={[styles.corner, styles.cornerBottomRight]} />
                                            
                                            {/* Scanning Line Animation */}
                                            {!isScanning && !scannedData && (
                                                <View style={styles.scanLine} />
                                            )}
                                            
                                            {/* Success Indicator */}
                                            {scannedData && (
                                                <View style={styles.successIndicator}>
                                                    <Icon name="check-circle" size={40} color="#4CAF50" />
                                                </View>
                                            )}
                                        </View>
                                        
                                        <View style={styles.overlaySide} />
                                    </View>
                                    
                                    {/* Bottom Overlay */}
                                    <View style={styles.overlayBottom} />
                                </View>
                            </CameraView>

                            {/* Processing Overlay */}
                            {isScanning && (
                                <View style={styles.processingOverlay}>
                                    <View style={styles.processingContent}>
                                        <ActivityIndicator size="large" color="#2196F3" />
                                        <Text style={styles.processingText}>Processing QR Code...</Text>
                                    </View>
                                </View>
                            )}
                        </>
                    )}
                </View>

                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                    <Icon name={scanInfo.icon} size={32} color="#FFFFFF" />
                    <Text style={styles.instructionText}>
                        {scanInfo.instruction}
                    </Text>
                    
                    {/* Demo Button for Testing */}
                    {__DEV__ && (
                        <TouchableOpacity 
                            style={styles.demoButton}
                            onPress={handleDemoScan}
                            disabled={isScanning}
                        >
                            <Icon name="bug-report" size={16} color="#FFFFFF" />
                            <Text style={styles.demoButtonText}>Demo Scan</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    closeButton: {
        padding: 8,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    flashButton: {
        padding: 8,
    },

    // Camera Container
    cameraContainer: {
        flex: 1,
        position: 'relative',
    },
    camera: {
        flex: 1,
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        paddingHorizontal: 40,
    },

    // Permission States
    permissionText: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    permissionSubtext: {
        fontSize: 14,
        color: '#CCCCCC',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    permissionButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // Camera Overlay
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    overlayTop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    overlayMiddle: {
        flexDirection: 'row',
        height: 250,
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },

    // Scan Frame
    scanFrame: {
        width: 250,
        height: 250,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: '#2196F3',
        borderWidth: 3,
    },
    cornerTopLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    cornerTopRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    cornerBottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
    },
    cornerBottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    scanLine: {
        width: '80%',
        height: 2,
        backgroundColor: '#2196F3',
        opacity: 0.8,
    },
    successIndicator: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Processing Overlay
    processingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    processingContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        minWidth: 200,
    },
    processingText: {
        fontSize: 16,
        color: '#333',
        marginTop: 12,
        fontWeight: '500',
    },

    // Instructions
    instructionsContainer: {
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    instructionText: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 22,
    },
    demoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 152, 0, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 16,
        gap: 6,
    },
    demoButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default QRScannerModal;