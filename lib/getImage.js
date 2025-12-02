// lib/getImage.js

export function getImage(imageName) {
  const images = {
    image_basket: require('../assets/products/image_basket.png'),
    image_bread: require('../assets/products/image_bread.png'),
    image_bread2: require('../assets/products/image_bread2.png'),
    image_cart: require('../assets/products/image_chicken.png'),
    image_coke: require('../assets/products/image_coke.png'),
    image_egg: require('../assets/products/image_egg.png'),
    image_hotdog: require('../assets/products/image_hotdog.png'),
    image_mayonnaise: require('../assets/products/image_mayonnaise.png'),
    image_milk: require('../assets/products/image_milk.png'),
    image_oreo: require('../assets/products/image_oreo.png'),
    image_pepsi: require('../assets/products/image_pepsi.png'),
    image_rice: require('../assets/products/image_rice.png'),
    default: require('../assets/products/image_cart.png'),
  };

  return images[imageName] || images.default;
}

// Uso en tu componente:
// import { getImage } from '../utils/getImage';
// 
// <Image source={getImage(product.image)} style={styles.image} />