import { Button } from '@/components/button/button';
import { Field } from '@/components/form/field/field';
import { Fieldset } from '@/components/form/fieldset/fieldset';
import { Layout } from '@/components/layout/layout';

export function Profile() {
	return (
		<Layout>
			<Fieldset>
				<Field>
					<Field.Label>Name</Field.Label>
					<Field.Contents>
						<input
							className="px-2 py-2 border-gray-500 border w-full"
							type="text"
							value="Your Name Here"
						/>
					</Field.Contents>
				</Field>
				<div className="col-span-2 flex flex-row-reverse gap-2">
					<Button>Save Changes</Button>
				</div>
			</Fieldset>
		</Layout>
	);
}
