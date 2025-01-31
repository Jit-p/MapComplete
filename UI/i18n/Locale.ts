import { UIEventSource } from "../../Logic/UIEventSource"
import { LocalStorageSource } from "../../Logic/Web/LocalStorageSource"
import { Utils } from "../../Utils"
import { QueryParameters } from "../../Logic/Web/QueryParameters"

export default class Locale {
    public static showLinkToWeblate: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    /**
     * Indicates that -if showLinkToWeblate is true- a link on mobile mode is shown as well
     */
    public static showLinkOnMobile: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    public static language: UIEventSource<string> = Locale.setup()

    private static setup() {
        let browserLanguage = "en"
        if (typeof navigator !== "undefined") {
            browserLanguage = navigator.languages?.[0] ?? navigator.language ?? "en"
        }
        const source = LocalStorageSource.Get("language", browserLanguage)
        if (!Utils.runningFromConsole) {
            // @ts-ignore
            window.setLanguage = function (language: string) {
                source.setData(language)
            }
        }
        if (QueryParameters.wasInitialized("language")) {
            const qp = QueryParameters.GetQueryParameter(
                "language",
                undefined,
                "The language to display mapcomplete in. Will be ignored in case a logged-in-user did set their language before. If the specified language does not exist, it will default to the first language in the theme."
            )
            Locale.language.setData(qp.data)
        }

        QueryParameters.GetBooleanQueryParameter(
            "fs-translation-mode",
            false,
            "If set, will show a translation button next to every string."
        ).addCallbackAndRunD((tr) => {
            Locale.showLinkToWeblate.setData(Locale.showLinkToWeblate.data || tr)
        })

        return source
    }
}
