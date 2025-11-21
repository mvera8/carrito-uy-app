import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppSection } from '../../components/AppSection';
import { AppButton } from '../../components/AppButton';
import { AppSpiner } from '../../components/AppSpiner';
import useTheme from '../../hooks/useTheme';
import { AppPublicidad } from '../../components/AppPublicidad';

const scan = () => {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcodeData, setBarcodeData] = useState(null);

  // Resetear estado cuando la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      // Cleanup cuando sales de la pantalla
      return () => {
        setScanned(false);
        setBarcodeData(null);
      };
    }, [])
  );

  const handleBarcodeScanned = ({ type, data }) => {
    setScanned(true);
    setBarcodeData({ type, data });
  };

  if (!permission) {
    return <View />;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },
    camera: {
      flex: 1,
			backgroundColor: "red"
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanFrame: {
      width: 250,
      height: 150,
      backgroundColor: 'transparent',
      marginBottom: 30
    },
    corner: {
      position: 'absolute',
      width: 30,
      height: 30,
      borderColor: colors.primary,
    },
    cornerTopLeft: {
      top: -3,
      left: -3,
      borderTopWidth: 5,
      borderLeftWidth: 5,
      borderTopLeftRadius: 12,
    },
    cornerTopRight: {
      top: -3,
      right: -3,
      borderTopWidth: 5,
      borderRightWidth: 5,
      borderTopRightRadius: 12,
    },
    cornerBottomLeft: {
      bottom: -3,
      left: -3,
      borderBottomWidth: 5,
      borderLeftWidth: 5,
      borderBottomLeftRadius: 12,
    },
    cornerBottomRight: {
      bottom: -3,
      right: -3,
      borderBottomWidth: 5,
      borderRightWidth: 5,
      borderBottomRightRadius: 12,
    },
    instructionText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    resultContainer: {
      marginBottom: 20,
      padding: 15,
      backgroundColor: '#f5f5f5',
      borderRadius: 10,
    },
    resultTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    resultText: {
      fontSize: 14,
      marginVertical: 5,
    },
    label: {
      fontWeight: '600',
    },
  });

  if (!permission.granted) {
    return (
      <AppSection>
        <Text>Necesitamos tu permiso para usar la cámara</Text>
        <AppButton
          pressFunction={requestPermission}
          text="Conceder"
          variant="dark"
        />
      </AppSection>
    );
  }

  return (
    <AppSection style={{ padding: 0 }}>
      {scanned
        ? <>
            {barcodeData &&
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>Código Escaneado</Text>
                <Text style={styles.resultText}>
                  <Text style={styles.label}>Tipo: </Text>
                  {barcodeData.type}
                </Text>
                <Text style={styles.resultText}>
                  <Text style={styles.label}>Datos: </Text>
                  {barcodeData.data}
                </Text>
              </View>
            }

            <AppSpiner />

            <AppButton
              pressFunction={() => {
                setScanned(false);
                setBarcodeData(null);
              }}
              text="Escanear de nuevo"
              variant="light"
            />
          </>
        : <>
				<AppPublicidad />
				<CameraView
            style={styles.camera}
            facing='back'
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: [
                'ean13',
                'ean8',
                'upc_a',
                'upc_e',
                'code128',
                'code39',
                'qr'
              ],
            }}
          >
            <View style={styles.overlay}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>
              <Text style={styles.instructionText}>
                Centra el código de barras
              </Text>
            </View>
          </CameraView>
				</>
      }
    </AppSection>
  );
};

export default scan;