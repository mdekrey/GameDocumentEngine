import { useState } from 'react';
import { Layout } from '@/components/layout/layout';

import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Profile } from '@/apps/profile/profile';
import { Button } from './components/button/button';

const router = createHashRouter([
	{
		path: 'profile',
		element: <Profile />,
	},
	{
		path: 'games',
		element: <Root />,
	},
	{
		path: 'create-game',
		element: <Root />,
	},
	{
		path: '/',
		element: <Navigate to="/games" />,
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

function Root() {
	const [count, setCount] = useState(0);
	return (
		<Layout>
			<Button onClick={() => setCount((count) => count + 1)}>
				count is {count}
			</Button>
		</Layout>
	);
}

export default App;
