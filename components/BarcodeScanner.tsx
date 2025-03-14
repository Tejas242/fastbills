import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from './ui/IconSymbol';

interface BarcodeScannerProps {
  isVisible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ isVisible, onClose, onScan }: BarcodeScannerProps) {
    const [facing, setFacing] = useState<CameraType>('back');
  const [isScanning, setIsScanning] = useState(true);
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();

  // Reset scanning state when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      setIsScanning(true);
    }
  }, [isVisible]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!isScanning) return;
    
    setIsScanning(false);
    onScan(data);
    onClose();
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={styles.modalText}>Loading camera permissions...</ThemedText>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <ThemedText style={[styles.textStyle, { color: colors.buttonText }]}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.modalText}>We need camera permission to scan barcodes</ThemedText>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.error, marginRight: 10 }]}
                onPress={onClose}
              >
                <ThemedText style={[styles.textStyle, { color: colors.buttonText }]}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={requestPermission}
              >
                <ThemedText style={[styles.textStyle, { color: colors.buttonText }]}>Grant Permission</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }


  return (
    <Modal
      visible={isVisible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'upc_e', 'upc_a', 'ean8', 'ean13', 'code128', 'code39', 'itf14', 'datamatrix'],
        }}
        onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}>
            <View style={styles.topButtonsContainer}>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.card }]}
                onPress={onClose}
              >
                <IconSymbol name="xmark" size={22} color={colors.error} />
                <ThemedText style={{ color: colors.error, marginLeft: 6 }}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.cameraToggleButton, { backgroundColor: colors.card }]}
                onPress={toggleCameraFacing}
              >
                <IconSymbol name="camera.rotate" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.middleContainer}>
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.focusedContainer}>
              {/* Scanner reticle or guide */}
              <View style={styles.scannerGuide}>
                <View style={[styles.scannerCorner, styles.topLeft]} />
                <View style={[styles.scannerCorner, styles.topRight]} />
                <View style={[styles.scannerCorner, styles.bottomLeft]} />
                <View style={[styles.scannerCorner, styles.bottomRight]} />
              </View>
            </View>
            <View style={styles.unfocusedContainer}></View>
          </View>
          
          <View style={styles.unfocusedContainer}>
            <ThemedText style={styles.instructionText}>
              Point the camera at a barcode
            </ThemedText>
          </View>
        </View>
      </CameraView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 15,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    paddingHorizontal: 20,
  },
  textStyle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  middleContainer: {
    flexDirection: 'row',
    flex: 1.5,
  },
  focusedContainer: {
    flex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerGuide: {
    width: 250,
    height: 250,
    position: 'relative',
    borderRadius: 5,
  },
  scannerCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderLeftWidth: 3,
    borderTopWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderRightWidth: 3,
    borderTopWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  topButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    width: '100%',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
    opacity: 0.9,
  },
  cameraToggleButton: {
    padding: 8,
    borderRadius: 30,
    opacity: 0.9,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingBottom: 60,
  }
});
