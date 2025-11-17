# Zevaldi – Vivaldi Custom UI

Highly opinionated custom tweaks for the Vivaldi browser UI with the goal of making it feel more like Zen Browser or Arc.

<video src="https://github.com/user-attachments/assets/fc0520f0-ba92-46db-b3ba-c6d8fa7bc1f3" controls></video>

Compatibility: Vivaldi 7.7.3851.52 ✅

## Features

- Auto‑hide header, tabs, and panel. They show on hover
- Hiding tabs and panel can be toggled with a hotkey
- Header always stays hidden

Bonus: keyboard shortcut to copy the current tab URL to the clipboard 🙂

## Nuances

- Zevaldi supports only one layout:
  - Vertical tabs on the left
  - Side panels on the right
- Zevaldi will be wiped with every Vivaldi update.

  Just a heads-up: you’ll need to reinstall it each time. Also, these tweaks might not work with the newest versions of Vivaldi. I’m using Vivaldi right now, so I’ll try to keep it up to date. Works great on Vivaldi 7.7 👌

- It might look different on different setups.

  Just so you know, the way things look and work can vary depending on the screen size, platform, and other factors. See [Adjustments](#adjustments) for more details.

  > On macOS there are unhideable window control buttons (Minimize, Maximize, and Close).
  >
  > I work around it with spacing. But on some sites it looks weird. I got used to it.

Also, to get the best experience, I recommend customizing toolbars and panels like in the demo video.

## Installation

### Via `install.sh`

The script works only on macOS, because I don't know where Vivaldi keeps its files on other platforms 🤷‍♀️

1. Clone the repository

```bash
git clone https://github.com/rgeraskin/zevaldi
```

2. Run the `install.sh` script

```bash
cd zevaldi
./install.sh
```

3. Restart Vivaldi
4. [Customize toolbar](#toolbar-customization)

### Manually

1. Clone the repository

```bash
git clone https://github.com/rgeraskin/zevaldi.git
```

2. Copy the files to the Vivaldi app bundle

- macOS `/Applications/Vivaldi.app/Contents/Frameworks/Vivaldi Framework.framework/Versions/Current/Resources/vivaldi`
- Windows
  > `<X.X.XXX.X>` is the Vivaldi version number.

  - Single user install `%UserProfile&\AppData\Local\Vivaldi\Application\<X.X.XXX.X>\resources\vivaldi`
  - System wide install `C:\Program Files\Vivaldi\Application\<X.X.XXX.X>\resources\vivaldi`

  - For Linux, you need to find where Vivaldi `window.html` is located - that's where you need to copy the files. Then tell me where it is and I will update the script and Readme 😁

```bash
# macOS
cd zevaldi
cp -r ui/* "/Applications/Vivaldi.app/Contents/Frameworks/Vivaldi Framework.framework/Versions/Current/Resources/vivaldi/"
```

3. Restart Vivaldi
4. [Customize toolbar](#toolbar-customization)

## Toolbar customization

To get the same look as in the demo, you have to tweak some settings. I ship a minimal configuration [Preferences](./Preferences) that has all you need. You have three options:

1. Put it in your profile dir. But your existing prefs will be overwritten, so you'll have to start configuring from scratch.

   - `~/Library/Application Support/Vivaldi/<Profile Name>` for macOS
   - `%UserProfile%\AppData\Local\Vivaldi\User Data\<Profile Name>` for Windows
   - For Linux, you need to find where Vivaldi `Preferences` file is located - that's the file you need to overwrite. Then tell me where it is and I will update the script and Readme 😁

   If you use only one profile, its name will be `Default`. Other profiles are named like `Profile 1`, `Profile 2`, and so on. Create a new one to test Zevaldi before overwriting your current settings.
2. Edit your `Preferences` by merging values from my prefs in your favorite JSON editor.
3. Configure manually through the UI.

Provided preferences have the following defaults:
1. Default hotkeys, but
   - `cmd+l` opens quick commands in current tab
   - `cmd+t` opens quick commands in new tab

   And command chain for `cmd+t`: New tab => Delay 100 => Quick Commands

   > Remap to `ctrl+l` and `ctrl+t` if you use Windows!
2. Don't show the address bar
3. Minimized status bar
4. Compact user interface density
5. Tabs to the left with a bit extended width and close buttons to the right
6. Panels to the right, as overlay
7. Tab bar customization (elements order):
   - `Spacer` - for traffic light buttons on macOS
   - `Spacer` - for traffic light buttons on macOS
   - `PanelToggle`
   - `FlexibleSpacer`
   - `Back`
   - `Reload`
   - `AddressField`
   - `<< tabs >>`
   - `NewTab`
   - `FlexibleSpacer`
   - `WorkspaceButton`
   - `AccountButton`
   - `TabButton`
   - `FlexibleSpacer`
   - `DownloadButton`
   - `TilingToggle`

## Usage

- **Toggle panels/vertical tabs auto‑hide**: press `Ctrl+E` to toggle the feature on/off. Header is always hidden.
- **Auto‑hide UI**: move your mouse to the top edge of the window to reveal the header, and to the left/right edges to reveal panels/vertical tabs.
- **Copy current tab URL**: press `Shift+Cmd/Win+C` to copy the active tab’s URL to the clipboard; a small toast appears on success.

## Configuration

You can configure Zevaldi in the `custom-ui.js` file.

- `autoHideToggleHotkey` – the keyboard shortcut to toggle the auto‑hide mode (default: `Ctrl+E`)
- `showDelay` – the delay in milliseconds before showing the UI elements on hover (default: `125`)
- `hideDelay` – the delay in milliseconds before hiding the UI elements after leaving hover area (default: `250`)
- `shouldHidePanels` – if true, side panels will hide/show with the rest of the UI (default: `true`)
- `hideTabs` – if true, tab bar will hide/show (default: `true`)
- `transitionTime` – the transition time for UI element animations (in seconds) (default: `0` = disabled, I don't like animations 🙂)

To configure the 'Copy current tab URL' shortcut (default: `Shift+Cmd/Win+C`), you need to edit the `copyUrlHotkey` value in the [copy-url-to-clipboard.js](https://github.com/rgeraskin/zevaldi/blob/master/ui/copy-url-to-clipboard.js#L5).

## Adjustments

If your UI looks weird, make sure you’ve done the [Toolbar customization](#toolbar-customization) first.

Second, try customizing your toolbar manually. For example, in the Tab Bar there are 'spaces' before the 'Hide Panel' button to work around the unhideable window control buttons on macOS — no need for those on Windows.

Finally, you can try adjusting CSS values. I recommend starting with
- [#header](https://github.com/rgeraskin/zevaldi/blob/master/ui/custom-ui.js#L451) if your window control buttons does not fit to the header
- [div.tabbar-wrapper](https://github.com/rgeraskin/zevaldi/blob/master/ui/custom-ui.css#L25) to adjust the size of the tabbar. Something like this:

   ```css
   height: 99%;
   margin-top: 5px
   ```
- [#webpage-stack](https://github.com/rgeraskin/zevaldi/blob/master/ui/custom-ui.css#L30) to tune main area margins (`margin-top`, `margin-bottom`...)

Play with values using DevTools (open `vivaldi:inspect/#apps` page). Then edit files to make your changes permanent and restart Vivaldi.

I'm definitely not a CSS expert, so feel free to suggest improvements in Issues. Also, PRs are welcome!

## Credits

- [Vivaldi Forum](https://forum.vivaldi.net/topic/92477/autohide-tab-bar-address-bar-show-on-hover/196?_=1763289286045), especially [@oudstand](https://forum.vivaldi.net/user/oudstand). I used his JS code as a starting point.