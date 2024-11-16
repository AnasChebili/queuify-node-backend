interface IParams {
  id: string;
}

interface Product {
  title: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  thumbnail: string;
}

export { IParams, Product };
