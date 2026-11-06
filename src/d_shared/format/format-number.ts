const KOREAN_NUMBER = new Intl.NumberFormat("ko-KR");

export const formatNumber = (value: number): string => KOREAN_NUMBER.format(value);
