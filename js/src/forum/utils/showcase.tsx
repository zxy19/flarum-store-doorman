import PurchaseHistory from "@xypp-store/common/models/PurchaseHistory";
import StoreItem from "@xypp-store/common/models/StoreItem";
import Group from "flarum/common/models/Group";
import app from "flarum/forum/app";
function groupName(id: number): string {
    if(!id)return "##";
    const g: Group | undefined = app.store.getById("groups", id + "");
    if (!g) {
        app.store.find("groups", id + "").then(() => {
            m.redraw();
        });
        return "#" + id;
    }
    return g.namePlural();
}

export function getShowcase(item: StoreItem, purchased?: PurchaseHistory) {
    let data = item.itemData() as any;
    if (purchased) {
        data = purchased.attribute("data") as any;
    }
    return <div class="dmk-Showcase">
        {data.key ? (<div>
            <b>{data.key}</b>
            <br />
            {app.translator.trans("xypp-store-doorman.forum.has_used", { count: data.uses })}
        </div>) : ""}
        <div>
            {app.translator.trans("xypp-store-doorman.forum.showcase", {
                group: groupName(data.groupId),
                count: data.count,
                activate: data.activate ? "Yes" : "No",
            })}
        </div>
    </div>;
}