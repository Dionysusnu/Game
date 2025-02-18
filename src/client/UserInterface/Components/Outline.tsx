import Roact from "@rbxts/roact";

interface Props {
	name: keyof typeof offsetMap;
	layer: "Outer" | "Inner";
}

const offsetMap = {
	Up: {
		anchor: new Vector2(0.5, 0),
		size: new UDim2(0, 3, 0, 5),
		position: new UDim2(0.5, 0, 0, 0),
	},
	Down: {
		anchor: new Vector2(0.5, 1),
		size: new UDim2(0, 3, 0, 5),
		position: new UDim2(0.5, 0, 1, 0),
	},
	Left: {
		anchor: new Vector2(0, 0.5),
		size: new UDim2(0, 5, 0, 3),
		position: new UDim2(0, 0, 0.5, 0),
	},
	Right: {
		anchor: new Vector2(1, 0.5),
		size: new UDim2(0, 5, 0, 3),
		position: new UDim2(1, 0, 0.5, 0),
	},
};

const layerMap = {
	Outer: {
		colour: Color3.fromRGB(255, 255, 255),
		transparency: 0,
	},
	Inner: {
		colour: Color3.fromRGB(195, 195, 195),
		transparency: 0.85,
	},
};

class Outline extends Roact.Component<Props> {
	render() {
		const direction = offsetMap[this.props.name];
		const layer = layerMap[this.props.layer];
		return (
			<frame
				Key={this.props.name}
				AnchorPoint={direction.anchor}
				BackgroundColor3={layer.colour}
				Transparency={layer.transparency}
				BorderSizePixel={0}
				Position={direction.position}
				Size={direction.size}
			/>
		);
	}
}

export = Outline;
