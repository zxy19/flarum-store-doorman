<?php

namespace Xypp\StoreDoorman;
use Flarum\User\User;

class AdminUser extends User
{
    public function assertAdmin()
    {
        return;
    }
}