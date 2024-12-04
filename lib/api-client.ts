import axios from 'axios';
import { refreshTokens } from './auth';

export const apiClient = axios.create({
  withCredentials: true
});