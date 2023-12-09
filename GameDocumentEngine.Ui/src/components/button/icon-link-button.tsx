import { Link } from 'react-router-dom';
import { iconButtonTheme } from './icon-button';
import { elementTemplate } from '../template';
import { defaultButtonThemes } from './buttonThemes';

const iconLinkButton = elementTemplate('IconLinkButton', Link, iconButtonTheme);

export const IconLinkButton = iconLinkButton.themed(defaultButtonThemes);
