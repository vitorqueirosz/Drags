import axios from 'axios';
import { Character } from 'pages/characters';

type FavoritesData = {
  characters: Character[];
  email: string;
};

export const useCreateFavorites = () => async (characters: FavoritesData) => {
  await axios.post('/api/favorites', characters);
};
