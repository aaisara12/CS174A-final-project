import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        super();
        this.hover = this.swarm = false;

        this.shapes = {
            'cube': new defs.Cube(),
            'square': new defs.Square(),
            'shaft': new defs.Capped_Cylinder(5, 20, [[0, 5], [0, 20]]),
            'tip': new defs.Closed_Cone(5, 20, [[0, 5], [0, 20]])
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
        };
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(5, -10, -30));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}

export class FinalProject extends Base_Scene {

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change Colors", ["c"], this.set_colors);

    }

    
    display(context, program_state) {
        super.display(context, program_state);
        const blue = hex_color("#1a9ffa");
        let model_transform = Mat4.identity();
        
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        // Example for drawing a cube, you can remove this line if needed
        // this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color:blue}));

        //move 
        model_transform = model_transform.times(Mat4.translation(t, 0, 0))
        
        // Start off the first box at a scale of 1.5x
        model_transform = model_transform.times(Mat4.scale(1, 1, 1))
            .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
            .times(Mat4.scale(0.3, 0.3, 20.0));

//         this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color:blue}));
        this.shapes.shaft.draw(context, program_state, model_transform, this.materials.plastic.override({color:blue}));

        model_transform = model_transform.times(Mat4.scale(1.0/0.3, 1.0/0.3, 1.0/20))
            .times(Mat4.translation(0, 0, 10))
            .times(Mat4.scale(1, 1, 1));

        this.shapes.tip.draw(context, program_state, model_transform, this.materials.plastic.override({color:blue}));
    }
}