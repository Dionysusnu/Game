import { Option, Result } from "@rbxts/rust-classes";
import { Workspace, Players } from "@rbxts/services";

const mouse = Players.LocalPlayer.GetMouse();

const DEFAULT_CFRAME = new CFrame(new Vector3(-300, 215, 0));
const MAX_MOVE_X = 5;
const MAX_MOVE_Y = 5;

const cameraPart = new Instance("Part");
cameraPart.Position = DEFAULT_CFRAME.Position.sub(new Vector3(0, 0, 5));
cameraPart.Name = "CameraPart";
cameraPart.Parent = Workspace;
cameraPart.CanCollide = false;
cameraPart.Anchored = true;
cameraPart.Transparency = 0;

export function getCamera() {
	let currentCamera = Workspace.CurrentCamera!;

	Workspace.GetPropertyChangedSignal("CurrentCamera").Connect(() => {
		const newCamera = Workspace.CurrentCamera;
		if (newCamera) currentCamera = newCamera;
	});

	return {
		move: function (this) {
			const viewport = currentCamera.ViewportSize;
			const offsetFromCenterX = mouse.X / viewport.X - 0.5;
			const offsetFromCenterY = -(mouse.Y / viewport.Y - 0.5);

			currentCamera.CFrame = DEFAULT_CFRAME.mul(
				new CFrame(MAX_MOVE_X * offsetFromCenterX, MAX_MOVE_Y * offsetFromCenterY, 0),
			);

			return this;
		},

		setActor: function (this, character: Option<Model>) {
			return character.map((rig) => {
				const playerHumanoid = rig.FindFirstChildOfClass("Humanoid")!;
				currentCamera.CameraSubject = playerHumanoid;
				currentCamera.CameraType = Enum.CameraType.Follow;

				return Result.ok(this);
			});
		},

		setActorNone: function (this) {
			cameraPart.Destroy();

			if (currentCamera && cameraPart) {
				currentCamera.CameraType = Enum.CameraType.Scriptable;
				currentCamera.CameraSubject = cameraPart;
				currentCamera.CFrame = DEFAULT_CFRAME;
			}

			return this;
		},

		addBlur: function <T>(this: T, blurLevel: number): Result<T, string> {
			if (currentCamera.FindFirstChildOfClass("BlurEffect") !== undefined) {
				return Result.err("BlurEffect already exists");
			}

			const newBlur = new Instance("BlurEffect");
			newBlur.Size = blurLevel;
			newBlur.Parent = currentCamera;

			return Result.ok(this);
		},

		removeBlur: function (this) {
			currentCamera.FindFirstChildOfClass("BlurEffect")?.Destroy();

			return this;
		},
	};
}
