import { Link } from 'react-router-dom';
import { iconButtonClasses } from './icon-button';
import { defaultButtonThemes } from './button';
import { elementTemplate } from '../template';

const iconLinkButton = elementTemplate<typeof Link>(
	'IconLinkButton',
	<Link to="" className={iconButtonClasses} />,
);

export const IconLinkButton = iconLinkButton.themed(defaultButtonThemes);
