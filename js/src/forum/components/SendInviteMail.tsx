import Modal from 'flarum/common/components/Modal';
import app from 'flarum/forum/app';
import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';
import setRouteWithForcedRefresh from 'flarum/common/utils/setRouteWithForcedRefresh';
import LinkButton from 'flarum/common/components/LinkButton';
import Group from 'flarum/common/models/Group';
export default class SendInviteMail extends Modal {
  fine = false;
  cb?: ((_: string) => void);
  reject?: ((_: { message: string }) => void);
  selectGroups = 0;
  activate = 0;
  groups: any = {};
  className() {
    return 'Modal--small';
  }
  title() {
    return app.translator.trans('xypp-store-doorman.forum.send.title');
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
  }
  content() {
    return (
      <div className="Modal-body">
        <div className="Form">
          <div className="Form-group">
            <label for="xypp-doorman-key-send-email">{app.translator.trans('xypp-store-doorman.forum.send.email')}</label>
            <input id="xypp-doorman-key-send-email" className="FormControl" step="any" type="email" />
          </div>
          <div className="Form-group store-control-spacing">
            <Button class="Button Button--primary" type="submit">
              {app.translator.trans('xypp-store-doorman.forum.send.submit')}
            </Button>
          </div>
        </div>
      </div >
    );
  }
  async onsubmit(e: any) {
    e.preventDefault();
    this.fine = true;
    this.cb && this.cb(this.$('#xypp-doorman-key-send-email').val() as string);
    app.modal.close();
  }
  onremove(..._: any) {
    if (!this.fine) {
      this.reject && this.reject({ message: app.translator.trans('xypp-store-doorman.forum.send.cancel') + "" });
    }
  }
}
