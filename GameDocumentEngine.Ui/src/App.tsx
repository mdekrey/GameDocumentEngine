import { useState } from 'react';
import { currentUserQuery } from './utils/api';
import { useQuery } from '@tanstack/react-query';

function App() {
	const { data } = useQuery({ ...currentUserQuery() });
	const [count, setCount] = useState(0);

	return (
		<>
			<div>{data?.data.name}</div>
			<button onClick={() => setCount((count) => count + 1)}>
				count is {count}
			</button>
		</>
	);
}

export default App;
