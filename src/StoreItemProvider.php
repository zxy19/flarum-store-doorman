<?php

namespace Xypp\StoreDoorman;

use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\User;
use FoF\Doorman\Commands\CreateDoorkey;
use FoF\Doorman\Doorkey;
use Xypp\Store\Context\ExpireContext;
use Xypp\Store\Context\PurchaseContext;
use Xypp\Store\Context\UseContext;
use Xypp\Store\PurchaseHistory;
use Xypp\Store\StoreItem;
use Illuminate\Contracts\Bus\Dispatcher;
use Flarum\Extension\ExtensionManager;
use Flarum\Http\UrlGenerator;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Mail\Message;

class StoreItemProvider extends \Xypp\Store\AbstractStoreProvider
{
    public $name = "doorman-key";
    public $canUseFrontend = true;
    /**
     * @var Dispatcher
     */
    protected $bus;

    /**
     * @var Mailer
     */
    protected $mailer;

    /**
     * @var Translator
     */
    protected $translator;

    /**
     * @var UrlGenerator
     */
    protected $url;

    /**
     * @var SettingsRepositoryInterface
     */
    protected $settings;

    /**
     * @var ExtensionManager
     */
    protected $extensions;

    public function __construct(
        Dispatcher $bus,
        Mailer $mailer,
        Translator $translator,
        UrlGenerator $url,
        SettingsRepositoryInterface $settings,
        ExtensionManager $extensions
    ) {
        $this->bus = $bus;
        $this->mailer = $mailer;
        $this->translator = $translator;
        $this->url = $url;
        $this->settings = $settings;
        $this->extensions = $extensions;
    }

    public function purchase(StoreItem $item, User $user, PurchaseHistory|null $old = null, PurchaseContext $context): array|bool|string
    {
        [$groupId, $count, $activate] = explode("|", $item->provider_data);

        $createCommand = new CreateDoorkey(new AdminUser(), [
            "attributes" => [
                "key" => Utils::generateRandomString(),
                "groupId" => $groupId,
                "maxUses" => $count,
                "activates" => $activate
            ]
        ]);

        $keyObj = $this->bus->dispatch($createCommand);
        return $keyObj->id;
    }
    public function serializeHistory(PurchaseHistory $item): array
    {
        $key = Doorkey::find($item->data);
        if (!$key) {
            return ["_unavailable" => true];
        }
        if ($key->uses >= $key->max_uses) {
            return ["_unavailable" => true];
        }
        return [
            "key" => $key->key,
            "groupId" => $key->group_id,
            "count" => $key->max_uses,
            "activates" => $key->activates,
            "uses" => $key->uses
        ];
    }
    public function serialize(StoreItem $item): array
    {
        $exps = explode("|", $item->provider_data);
        if (count($exps) != 3)
            return [
                "_unavailable" => true
            ];
        [$groupId, $count, $activate] = $exps;
        return [
            "groupId" => $groupId,
            "count" => $count,
            "activate" => $activate
        ];
    }
    public function useItem(PurchaseHistory $item, User $user, string $data, UseContext $context): bool
    {
        $doorkey = Doorkey::find($item->data);
        if (!$doorkey) {
            $context->exceptionWith("xypp-store-doorman.forum.key-not-found");
        }
        $context->noConsume();

        $title = $this->settings->get('forum_title');
        $subject = $this->settings->get('forum_title') . ' - ' . $this->translator->trans('fof-doorman.forum.email.subject');
        $body = $this->translator->trans('fof-doorman.forum.email.body', [
            '{forum}' => $title,
            '{url}' => $this->extensions->isEnabled('fof-direct-links') ? $this->url->to('forum')->route('direct-links-signup') : $this->url->to('forum')->base(),
            '{code}' => $doorkey->key,
        ]);
        try {
            $this->mailer->raw(
                $body,
                function (Message $message) use ($subject, $data) {
                    $message->to($data)->subject($subject);
                }
            );
        } catch (\Exception $e) {
            $context->exceptionWith("xypp-store-doorman.forum.send.failed");
        }
        return true;
    }
    public function expire(PurchaseHistory $item, ExpireContext $context): bool
    {
        $key = Doorkey::find($item->data);
        if ($key) {
            $key->delete();
        }
        return true;
    }
}