import '@/utils/api/queries';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import { ClockSvg } from './clock-svg';
import { ClockEdit } from './clock-edit';
import type { Clock } from './clock-types';
import { Section, SingleColumnSections } from '@/components/sections';
import { AtomContents } from '@/components/jotai/atom-contents';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';

const radius = 70;
const padding = 2;
export function Clock({
	form,
	onSubmit,
	readablePointers,
}: GameObjectFormComponent<Clock>) {
	useSubmitOnChange(form, onSubmit);

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<SingleColumnSections>
				<Section>
					<AtomContents>
						{useComputedAtom((get) => (
							<ClockSvg
								className="self-center mx-auto"
								currentTicks={get(form.atom).details.current}
								totalTicks={get(form.atom).details.max}
								padding={padding}
								radius={radius}
								width={radius * 2 + padding}
								height={radius * 2 + padding}
							/>
						))}
					</AtomContents>
				</Section>
				<Section>
					<ClockEdit form={form} readablePointers={readablePointers} />
				</Section>
			</SingleColumnSections>
		</form>
	);
}
