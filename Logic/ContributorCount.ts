// SPDX-FileCopyrightText: 2023 MapComplete  <https://mapcomplete.osm.be/>
//
// SPDX-License-Identifier: GPL-3.0-ONLY

/// Given a feature source, calculates a list of OSM-contributors who mapped the latest versions
import { Store, UIEventSource } from "./UIEventSource"
import { BBox } from "./BBox"
import GeoIndexedStore from "./FeatureSource/Actors/GeoIndexedStore"

export default class ContributorCount {
    public readonly Contributors: UIEventSource<Map<string, number>> = new UIEventSource<
        Map<string, number>
    >(new Map<string, number>())
    private readonly perLayer: ReadonlyMap<string, GeoIndexedStore>
    private lastUpdate: Date = undefined

    constructor(state: {
        mapProperties: { bounds: Store<BBox> }
        dataIsLoading: Store<boolean>
        perLayer: ReadonlyMap<string, GeoIndexedStore>
    }) {
        this.perLayer = state.perLayer
        const self = this
        state.mapProperties.bounds.mapD(
            (bbox) => {
                self.update(bbox)
            },
            [state.dataIsLoading]
        )
    }

    private update(bbox: BBox) {
        const now = new Date()
        if (
            this.lastUpdate !== undefined &&
            now.getTime() - this.lastUpdate.getTime() < 1000 * 60
        ) {
            return
        }
        this.lastUpdate = now
        const featuresList = [].concat(
            Array.from(this.perLayer.values()).map((fs) => fs.GetFeaturesWithin(bbox))
        )
        const hist = new Map<string, number>()
        for (const list of featuresList) {
            for (const feature of list) {
                const contributor = feature.properties["_last_edit:contributor"]
                const count = hist.get(contributor) ?? 0
                hist.set(contributor, count + 1)
            }
        }
        this.Contributors.setData(hist)
    }
}
