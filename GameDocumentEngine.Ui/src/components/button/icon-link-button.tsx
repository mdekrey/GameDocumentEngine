import { Link } from 'react-router-dom';
import { iconButtonTheme } from './icon-button';
import { defaultButtonThemes } from './button';
import { elementTemplate } from '../template';

const iconLinkButton = elementTemplate('IconLinkButton', Link, iconButtonTheme);

export const IconLinkButton = iconLinkButton.themed(defaultButtonThemes);
