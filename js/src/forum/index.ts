import app from 'flarum/forum/app';
import { addFrontendProviders } from "@xypp-store/forum"
import CreateDoorKeyModal from './components/CreateDoorKeyModal';
import SendInviteMail from './components/SendInviteMail';
import { getShowcase } from './utils/showcase';
function getDoorkeyItem(): Promise<string> {
  return new Promise((resolve, reject) => {
    app.modal.show(CreateDoorKeyModal, {
      cb: resolve,
      reject
    }, true);
  });
}
function getUseData(): Promise<string> {
  return new Promise((resolve, reject) => {
    app.modal.show(SendInviteMail, {
      cb: resolve,
      reject
    }, true);
  });
}
app.initializers.add('xypp/store-doorman', () => {
  addFrontendProviders(
    "doorman-key",
    app.translator.trans("xypp-store-doorman.forum.key") as string,
    async (providerDatas, specialDatas) => {
      providerDatas['key'] = app.translator.trans("xypp-store-doorman.forum.create.select") as string;
      specialDatas['key'] = getDoorkeyItem;
    },
    getShowcase,
    getUseData
  );
});
