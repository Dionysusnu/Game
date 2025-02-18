import { registerListenerIn } from "shared/registerListenersIn";
registerListenerIn(script.FindFirstChild("listeners")!);

import { Players, StarterGui } from "@rbxts/services";
import Roact from "@rbxts/roact";
import { Home } from "client/UserInterface/App/Home";
import remotes from "shared/remotes";
import Ballot from "client/UserInterface/App/Ballot";

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui");

StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.PlayerList, false);

Roact.mount(
	<screengui Key={"HomeScreen"} IgnoreGuiInset={true} ResetOnSpawn={false}>
		<Home />
	</screengui>,
	playerGui,
);
