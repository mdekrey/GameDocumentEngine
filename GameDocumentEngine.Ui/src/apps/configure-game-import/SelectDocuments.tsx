import type { GameImportArchiveSummary } from '@vaultvtt/api/openapi/models/GameImportArchiveSummary';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import type { ImportDocumentFormOptions } from './mappings';
import { useFieldList } from '@/doc-types/Break-Character/parts/useFieldList';
import { CheckboxField } from '@/components/form-fields/checkbox-input/checkbox-field';
import { Prose } from '@/components/text/common';

export function SelectDocuments({
	field,
	documents,
}: {
	field: FormFieldReturnType<ImportDocumentFormOptions[]>;
	documents: GameImportArchiveSummary['documents'];
}) {
	const defaultOption: ImportDocumentFormOptions = {
		id: '',
		selected: false,
	};
	const { length, item, key } = useFieldList(field, defaultOption, (v) => v.id);
	return (
		<>
			{Array(length)
				.fill(0)
				.map((_, index) => (
					<ConfigureDocumentOptions
						key={key(index)}
						field={item(index)}
						document={documents[index]}
					/>
				))}
		</>
	);
}

function ConfigureDocumentOptions({
	field,
	document,
}: {
	field: FormFieldReturnType<ImportDocumentFormOptions>;
	document: GameImportArchiveSummary['documents'][number];
}) {
	const { selected } = useFormFields(field, {
		selected: ['selected'],
	});
	return (
		<div>
			<Prose>{document.name}</Prose>
			<CheckboxField field={selected} />
		</div>
	);
}
