import { useState } from 'react';
import { Layout } from '@/components/layout/layout';

function App() {
	const [count, setCount] = useState(0);

	return (
		<Layout>
			<button onClick={() => setCount((count) => count + 1)}>
				count is {count}
			</button>
		</Layout>
	);
}

export default App;
