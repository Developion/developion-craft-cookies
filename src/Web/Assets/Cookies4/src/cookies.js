import { Plugin } from 'ckeditor5/src/core'
import { ButtonView } from 'ckeditor5/src/ui'
import shortcodesIcon from './../theme/icons/ckeditor.svg'

export default class Cookies extends Plugin {
	static get pluginName() {
		return 'Cookies'
	}

	init() {
		const editor = this.editor
		const base = this.editor.data.processor
		const shyButton = window.shyButton
		const { t } = editor.locale

		editor.ui.componentFactory.add('cookies', locale => {
			const buttonView = new ButtonView(locale)

			buttonView.set({
				label: shyButton.label,
				icon: shortcodesIcon,
				// icon: shyButton.icon,
				withText: false,
				tooltip: true,
			})

			buttonView.on('execute', () => {
				editor.model.change(writer => {
					const text = writer.createText(shyButton.placeholder)
					editor.model.insertContent(text, editor.model.document.selection)
				})
			})

			return buttonView
		})

		const toDataReplacements = (html) => {
			html = html.split(shyButton.placeholder).join(shyButton.value);
			return html;
		};

		const toViewPreprocess = (html) => {
			html = html.split(shyButton.value).join(shyButton.placeholder);
			html = html.split('­').join(shyButton.placeholder);
			return html;
		};

		editor.data.processor = {
			toData: (viewFragment) => {
				const html = base.toData(viewFragment);
				return toDataReplacements(html);
			},
			toView: (data) => {
				const pre = toViewPreprocess(data);
				return base.toView(pre);
			},
			registerRawContentMatcher: (...args) =>
				base.registerRawContentMatcher?.(...args),
			useFillerType: (...args) => base.useFillerType?.(...args),
			getDomChildren: (...args) => base.getDomChildren?.(...args),
			_base: base
		};
	}
}
