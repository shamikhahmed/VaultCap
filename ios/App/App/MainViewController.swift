import UIKit
import Capacitor

/// Root bridge view controller (Main.storyboard). Registers app-local plugins.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(VaultNativePlugin())
    }
}
