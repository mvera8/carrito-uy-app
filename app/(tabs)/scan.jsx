import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppSection, AppPublicidad, AppContainer, TextTitle, CardProduct, AppSpiner, AppButton } from '../../components';
import { getProducts } from '../../lib/getProducts';
import { neon } from '@neondatabase/serverless';
import useTheme from '../../hooks/useTheme';

const scan = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcodeData, setBarcodeData] = useState(null);
  const [foundProduct, setFoundProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedToDb, setSavedToDb] = useState(false);
  const isProcessing = useRef(false);

  // Solicitar permiso cuando el componente se monta
  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      return;
    }
    
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  // Resetear estado cuando la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      return () => {
        setScanned(false);
        setBarcodeData(null);
        setFoundProduct(null);
        setSavedToDb(false);
        isProcessing.current = false;
      };
    }, [])
  );

  const handleBarcodeScanned = async ({ type, data }) => {
    // Prevenir escaneos múltiples usando ref (inmediato)
    if (isProcessing.current) {
      console.log('Ya se está procesando un escaneo, ignorando...');
      return;
    }
    
    isProcessing.current = true;
    setScanned(true);
    setBarcodeData({ type, data });
    setLoading(true);
    setSavedToDb(false);

    try {
      // Obtener todos los productos
      const products = await getProducts();
      
      // Buscar producto que coincida con el código escaneado
      const product = products.find(p => p.ean13 === data);
      
      if (product) {
        console.log('Producto encontrado!');
        setFoundProduct(product);
      } else {
        console.log('Producto NO encontrado - Guardando en BD...');

        try {
          const dbUrl = process.env.EXPO_PUBLIC_DATABASE_URL || process.env.DATABASE_URL;
          
          if (!dbUrl) {
            console.error('Error: DATABASE_URL no configurada');
            return;
          }

          const sql = neon(dbUrl);
          
          await sql`
            INSERT INTO escaneos (ean13, type, status, created_at)
            VALUES (
              ${data}, 
              ${type}, 
              'not_created',
              NOW()
            )
          `;
          
          console.log('Código guardado exitosamente en la base de datos');
          setSavedToDb(true);
          
        } catch (dbError) {
          console.error('Error al guardar en base de datos:', dbError);
          // Continuar con la ejecución aunque falle el guardado
        }
      }
    } catch (error) {
      console.error('Error buscando producto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    router.push({
      pathname: "/product",
      params: { product: JSON.stringify(product) }
    });
  };

  const handleScanAgain = () => {
    setScanned(false);
    setBarcodeData(null);
    setFoundProduct(null);
    setSavedToDb(false);
    isProcessing.current = false;
  };

  if (!permission) {
    return (
      <AppSection>
        <AppSpiner />
      </AppSection>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },
    camera: {
      flex: 1,
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
    resultText: {
      fontSize: 14,
      marginVertical: 5,
      color: colors.text,
    },
    label: {
      fontWeight: '600',
    },
    notFoundText: {
      color: colors.text,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    savedText: {
      color: colors.primary,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 10,
      fontStyle: 'italic',
    },
    deniedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    deniedText: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
      color: colors.text,
    },
  });

  if (!permission.granted) {
    return (
      <AppSection style={{ justifyContent: 'center' }}>
        <TextTitle>
          {permission.canAskAgain 
            ? 'Necesitamos acceso a la cámara para escanear códigos de barras'
            : 'El acceso a la cámara fue denegado. Por favor, habilítalo en la configuración de tu dispositivo.'
          }
        </TextTitle>
        {permission.canAskAgain && (
          <AppButton
            pressFunction={requestPermission}
            text="Permitir acceso a la cámara"
            variant="dark"
          />
        )}
      </AppSection>
    );
  }

  return (
    <AppSection>
      <AppContainer>
        {scanned
          ? <>
              {loading ? (
                <AppSpiner />
              ) : foundProduct ? (
                <>
                  <TextTitle>Producto encontrado</TextTitle>

                  <Text style={styles.resultText}>
                    <Text style={styles.label}>Código: </Text>
                    {barcodeData.data}
                  </Text>

                  <CardProduct
                    product={foundProduct}
                    minPrice={
                      Object.values(foundProduct.prices).length > 0
                        ? Math.min(...Object.values(foundProduct.prices).map(p => p.price))
                        : "N/A"
                    }
                    pressFunction={() => handleSelectProduct(foundProduct)}
                  />

                  <AppButton
                    pressFunction={handleScanAgain}
                    text="Escanear otro producto"
                    variant="light"
                  />
                </>
              ) : (
                <>
                  <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Código Escaneado</Text>
                    <Text style={styles.resultText}>
                      <Text style={styles.label}>Tipo: </Text>
                      {barcodeData.type}
                    </Text>
                    <Text style={styles.resultText}>
                      <Text style={styles.label}>Código: </Text>
                      {barcodeData.data}
                    </Text>
                  </View>

                  <Text style={styles.notFoundText}>
                    ❌ Producto no encontrado en nuestra base de datos
                  </Text>

                  {savedToDb && (
                    <Text style={styles.savedText}>
                      ℹ️ Código guardado para futuras referencias
                    </Text>
                  )}

                  <AppButton
                    pressFunction={handleScanAgain}
                    text="Escanear de nuevo"
                    variant="light"
                  />
                </>
              )}
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
      </AppContainer>
    </AppSection>
  );
};

export default scan;