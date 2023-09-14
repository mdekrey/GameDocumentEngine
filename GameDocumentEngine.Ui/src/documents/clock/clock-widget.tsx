import '@/utils/api/queries';
import type { GameObjectFormComponent } from '../defineDocument';
import { ClockSvg } from './clock-svg';
import { ClockEdit } from './clock-edit';
import type { Clock } from './clock-types';
import { useEffect } from 'react';
import { Section, SingleColumnSections } from '@/components/sections';
import { FormEvents } from '@/utils/form/events/FormEvents';
import { AtomContents } from '@/components/jotai/atom-contents';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';

export function Clock({
	form,
	onSubmit,
	readablePointers,
}: GameObjectFormComponent<Clock>) {
	useEffect(() => {
		form.formEvents.addEventListener(FormEvents.AnyBlur, submitOnChange);
		return () => {
			form.formEvents.removeEventListener(FormEvents.AnyBlur, submitOnChange);
		};

		function submitOnChange() {
			form.handleSubmit(onSubmit)();
		}
	}, [form, onSubmit]);

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
								padding={2}
								radius={70}
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
