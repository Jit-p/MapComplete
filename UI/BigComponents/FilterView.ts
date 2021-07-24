import { FixedUiElement } from "./../Base/FixedUiElement";
import { LayerConfigJson } from "./../../Customizations/JSON/LayerConfigJson";
import { UIEventSource } from "../../Logic/UIEventSource";
import { VariableUiElement } from "../Base/VariableUIElement";
import State from "../../State";
import Toggle from "../Input/Toggle";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import BaseUIElement from "../BaseUIElement";
import { Translation } from "../i18n/Translation";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import Svg from "../../Svg";

/**
 * Shows the filter
 */
export default class FilterView extends ScrollableFullScreen {
  constructor(isShown: UIEventSource<boolean>) {
    super(FilterView.GenTitle, FilterView.Generatecontent, "filter", isShown);
  }

  private static GenTitle(): BaseUIElement {
    return new FixedUiElement(`Filter`).SetClass(
      "text-2xl break-words font-bold p-2"
    );
  }

  private static Generatecontent(): BaseUIElement {
    let filterPanel: BaseUIElement = new FixedUiElement("");

    if (State.state.filteredLayers.data.length > 1) {
      let activeLayers = State.state.filteredLayers;

      if (activeLayers === undefined) {
        throw "ActiveLayers should be defined...";
      }

      const checkboxes: BaseUIElement[] = [];

      for (const layer of activeLayers.data) {
        const iconStyle = "width:1.5rem;height:1.5rem;margin-left:1.25rem";

        const icon = new Combine([Svg.checkbox_filled]).SetStyle(iconStyle);
        const iconUnselected = new Combine([Svg.checkbox_empty]).SetStyle(
          iconStyle
        );

        if (layer.layerDef.name === undefined) {
          continue;
        }

        const style = "display:flex;align-items:center;color:#007759";

        const name: Translation = Translations.WT(layer.layerDef.name)?.Clone();

        const styledNameChecked = name
          .Clone()
          .SetStyle("font-size:large;padding-left:1.25rem");

        const styledNameUnChecked = name
          .Clone()
          .SetStyle("font-size:large;padding-left:1.25rem");

        const layerChecked = new Combine([icon, styledNameChecked]).SetStyle(
          style
        );

        const layerNotChecked = new Combine([
          iconUnselected,
          styledNameUnChecked,
        ]).SetStyle(style);

        checkboxes.push(
          new Toggle(layerChecked, layerNotChecked, layer.isDisplayed)
            .ToggleOnClick()
            .SetStyle("margin:0.3em;")
        );
      }

      let combinedCheckboxes = new Combine(checkboxes);
      combinedCheckboxes.SetStyle("display:flex;flex-direction:column;");

      filterPanel = new Combine([combinedCheckboxes]);

      return filterPanel;
    }
  }
}