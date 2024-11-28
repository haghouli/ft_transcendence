const DOMAIN_NAME = 'localhost';

export const BACKEND_BASED_URL = `https://${DOMAIN_NAME}:8000`

export const BACKEND_BASED_SOCKET_URL = `wss://${DOMAIN_NAME}:8000`

export const COOKIE_NAME = 'my_token'

export const REFRESH_TOKEN = 'refresh'

export const LANG_COOKIE = 'lang'

export const TWOFA_COOKIE = "_2fa"

export const DEFAULT_GAME_COOKIE = 'default_game'

export const DEFAULT_BOARD_COLOR_COOKIE = 'default_bc'

export const INTRA_URL = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-7442b875083283b731c9dc5d4f86a28e615632e18b679667bd0714bbdbbad09f&redirect_uri=https%3A%2F%2Flocalhost%3A8000%2Fapi%2Fintra_callback%2F&response_type=code"