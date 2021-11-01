import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
    }
}

class Cube_Outline extends Shape {
    constructor() {
        super("position", "color");
        //  TODO (Requirement 5).
        // When a set of lines is used in graphics, you should think of the list entries as
        // broken down into pairs; each pair of vertices will be drawn as a line segment.
        // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
        
        // Line 1: width,  Line 2: depth,  Line3: height
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [1, -1, -1], [1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, 1, -1], [1, 1, 1],
            [-1, -1, -1], [-1, 1, -1], [1, -1, -1], [1, 1, -1], [-1, -1, 1], [-1, 1, 1], [1, -1, 1], [1, 1, 1]
        );
        
        
        for(let i = 0; i < 24; i++)
        {
            this.arrays.color[i] = color(1, 1, 1, 1);
        }

        this.indices = false;
    }
}

class Cube_Single_Strip extends Shape {
    constructor() {
        super("position", "normal");
        // TODO (Requirement 6)

        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1]
        );

        this.arrays.normal = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1]
        );
        
        // Row 1: back
        // Row 2: right
        // Row 3: front
        // Row 4: left
        // Row 5: rop
        // Row 6: bottom
        this.indices.push(4, 1, 0, 0, 5, 4,
                          3, 1, 4, 4, 6, 3,
                          6, 7, 2, 2, 3, 6,
                          0, 2, 7, 7, 5, 0,
                          6, 4, 5, 5, 7, 6,
                          3, 2, 0, 0, 1, 3
                          );
    }
}


class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'cube': new Cube(),
            'outline': new Cube_Outline(),
            'triangle': new Cube_Single_Strip(),
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

export class Assignment2 extends Base_Scene {
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */

    constructor()
    {
        super();
        this.isStopped = false;
        this.isOutline = false;
        this.box_colors = [];
        
        // Randomly initialize the colors of the boxes
        for(let i = 0; i < 8; i++)
        {
            this.box_colors[i] = color(Math.random(), Math.random(), Math.random(), 1.0);
        }
    }

    set_colors() {
        // TODO:  Create a class member variable to store your cube's colors.
        // Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
        // Hint2: You can consider add a constructor for class Assignment2, or add member variables in Base_Scene's constructor.

        for(let i = 0; i < 8; i++)
        {
            this.box_colors[i] = color(Math.random(), Math.random(), Math.random(), 1.0);
        }
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change Colors", ["c"], this.set_colors);
        // Add a button for controlling the scene.
        this.key_triggered_button("Outline", ["o"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off

            this.isOutline = !this.isOutline;
        });
        this.key_triggered_button("Sit still", ["m"], () => {
            // TODO:  Requirement 3d:  Set a flag here that will toggle your swaying motion on and off.

            this.isStopped = !this.isStopped;
        });
    }

    draw_box(context, program_state, model_transform, color, index) {
        // TODO:  Helper function for requirement 3 (see hint).
        //        This should make changes to the model_transform matrix, draw the next box, and return the newest model_transform.
        // Hint:  You can add more parameters for this function, like the desired color, index of the box, etc.
        
        // Draw the cube based on the passed transform
        


        if(!this.isOutline)
        {
            if(index % 2 == 0)
                this.shapes.triangle.draw(context, program_state, model_transform, this.materials.plastic.override(color), "TRIANGLE_STRIP");
            else
                this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override(color));
        }
        else
            this.shapes.outline.draw(context, program_state, model_transform, this.white, "LINES");
        
        // After we draw the box, we want to "offset" the scaling that will occur in the next iteration so that the scaling doesn't compound
        model_transform = model_transform.times(Mat4.scale(1, 2/3, 1));
        
        // Calculate the rotation of the cubes given the current time
        const MAX_ANGLE = .05*Math.PI;
        let rot_angle = MAX_ANGLE;
        if(!this.isStopped)             // Slightly messy conditional for allowing motion only if the user has not pressed the "Sit still" button
            rot_angle = MAX_ANGLE*0.5 * (1 + Math.sin( ((2*Math.PI)/2000) * program_state.animation_time ));

        // The next transform should account for another cube rotation about a hinge
        model_transform = model_transform
                .times(Mat4.translation(-1, 1.5, 0))      // Translate rotated cube up so that its bottom-left corner rests just above the previous cube's top-left corner
                .times(Mat4.rotation(rot_angle, 0, 0, 1))     // Rotate cube about origin
                .times(Mat4.translation(1, 1.5, 0))      // Translate cube so that bottom-left corner is touching origin
                .times(Mat4.scale(1, 1.5, 1));

        return model_transform;
    }

    display(context, program_state) {
        super.display(context, program_state);
        const blue = hex_color("#1a9ffa");
        let model_transform = Mat4.identity();

        // Example for drawing a cube, you can remove this line if needed
        // this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color:blue}));

        // TODO:  Draw your entire scene here.  Use this.draw_box( graphics_state, model_transform ) to call your helper.
        
        // Start off the first box at a scale of 1.5x
        model_transform = model_transform.times(Mat4.scale(1, 1.5, 1));

        // Draw 8 cubes, each cube 2 units above the previous
        for(let i = 0; i < 8; i++)
        {
            model_transform = this.draw_box(context, program_state, model_transform, this.box_colors[i], i);
        }
    }
}