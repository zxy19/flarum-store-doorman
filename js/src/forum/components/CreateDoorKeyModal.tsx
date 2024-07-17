import Modal from 'flarum/common/components/Modal';
import app from 'flarum/forum/app';
import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';
import setRouteWithForcedRefresh from 'flarum/common/utils/setRouteWithForcedRefresh';
import LinkButton from 'flarum/common/components/LinkButton';
import Group from 'flarum/common/models/Group';
export default class CreateDoorKeyModal extends Modal {
  loading = true;
  fine = false;
  cb?: ((_: string) => void);
  reject?: (() => void);
  selectGroups = 0;
  activate = 0;
  groups: any = {};
  className() {
    return 'Modal--small';
  }
  title() {
    return app.translator.trans('xypp-store-doorman.forum.create.title');
  }
  oncreate(vnode: any): void {
    super.oncreate(vnode);
    const that = this;
    //@ts-ignore
    this.cb = this.attrs?.cb;
    //@ts-ignore
    this.reject = this.attrs?.reject;
    if (!this.cb) {
      app.modal.close();
      return;
    }
    app.store.find("groups").then(() => {
      (app.store.all("groups") as Group[])
        .filter((g) => g.id() != "2")
        .forEach((group: Group) => {
          const id = group.id();
          id && (that.groups[id] = group.namePlural());
        });
      that.loading = false;
      m.redraw();
    })
  }
  content() {
    return (
      <div className="Modal-body">
        <div className="Form">
          <div className="Form-group">
            <label for="xypp-doorman-key-create-count">{app.translator.trans('xypp-store-doorman.forum.create.count')}</label>
            <input id="xypp-doorman-key-create-count" className="FormControl" step="any" />
          </div>
          <div className='Form-group'>
            <label for="xypp-doorman-key-create-group">{app.translator.trans('xypp-store-doorman.forum.create.group')}</label>
            <Select id="xypp-doorman-key-create-group" value={this.selectGroups} options={this.groups} onchange={this.changeGroup.bind(this)}></Select>
          </div>
          <div className="Form-group">
            <label for="xypp-doorman-key-create-activate">{app.translator.trans('xypp-store-doorman.forum.create.activate')}</label>
            <Select id="xypp-doorman-key-create-activate" value={this.activate} options={{1:"Yes",0:"No"}} onchange={this.changeActivate.bind(this)} className="FormControl" />
          </div>
          <div className="Form-group store-control-spacing">
            <Button class="Button Button--primary" type="submit" loading={this.loading}>
              {app.translator.trans('xypp-store-doorman.forum.create.submit')}
            </Button>
          </div>
        </div>
      </div >
    );
  }
  async onsubmit(e: any) {
    e.preventDefault();
    this.fine = true;
    this.cb && this.cb(this.$('#xypp-doorman-key-create-group').val()
      + "|" + this.$('#xypp-doorman-key-create-count').val()
      + "|" + this.$('#xypp-doorman-key-create-activate').val()
    );
    app.modal.close();
  }
  onremove(..._:any) {
    if (!this.fine) {
      this.reject && this.reject();
    }
  }

  changeGroup(e: number) {
    this.selectGroups = e;
  }
  changeActivate(e: number){
    this.activate = e;
  }
}
