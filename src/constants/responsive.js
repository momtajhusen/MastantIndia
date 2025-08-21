import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

export const rh = (percentage) => responsiveHeight(percentage);
export const rw = (percentage) => responsiveWidth(percentage);
export const rf = (fontSize) => responsiveFontSize(fontSize);