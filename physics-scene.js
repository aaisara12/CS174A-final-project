import {defs, tiny} from './examples/common.js';
import {GameObject} from './gameobject.js';

// Component import statements
import {TestMovement} from './component.js';
import {StayStill} from './component.js';
import {FallDown} from './component.js';
import {ForwardDown} from './component.js';

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
            'square': new defs.Square()
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

export class PhysicsScene extends Base_Scene {

    constructor()
    {
        super();
        
        this.gameobjects = [];                               // List of GameObjects in scene
        
        // Test object
//         this.gameobjects.push(new GameObject(this.shapes.square, Mat4.identity(), [new TestMovement()], this.materials.plastic));
        
        // Testing collision
        let floor = Mat4.identity();
        floor = floor.times(Mat4.translation(-5, 0, 0)).times(Mat4.scale(10,1,5));
        this.gameobjects.push(new GameObject(this.shapes.cube, floor, [new StayStill()], this.materials.plastic));

        let falling = Mat4.identity();
        let rand_num = Math.random() * (5 + 10) - 10;
        falling = falling.times(Mat4.translation(-5, 5, 0));

//         this.gameobjects.push(new GameObject(this.shapes.cube, falling, [new FallDown()], this.materials.plastic));
        
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change Colors", ["c"], this.set_colors);
        this.key_triggered_button("Spawn square", ["q"], () => this.spawn_gameObject(this.shapes.square, Mat4.identity(), [new TestMovement()], this.materials.plastic));
        
        let cube_direction = Mat4.identity();
        cube_direction = cube_direction.times(Mat4.translation(-5, 5, 0));
        this.key_triggered_button("Spawn cube", ["n"], () => this.spawn_gameObject(this.shapes.cube, cube_direction, [new ForwardDown()], this.materials.plastic));
        // TODO: Add button to spawn in a projectile 

    }

    // Make a special function that spawns in a GameObject into the scene (instantiates a GameObject using a "prefab")
    spawn_gameObject(model, start_transform, components, material)
    {
        this.gameobjects.push(new GameObject(model, start_transform, components, material));
    }

    
    display(context, program_state) {
        super.display(context, program_state);
        
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        // Update each GameObject in the scene then draw it
        for(let i = 0; i < this.gameobjects.length; i++)
        {
            // this.gameobjects[i].update(t, dt);
            
            if(this.gameobjects[i].transform.model_transform[0][3] > 5){
                this.gameobjects[i].update(0,0);
            }
            else{
                this.gameobjects[i].update(t, dt);
            }
            this.gameobjects[i].draw(context, program_state);
            // console.log(this.gameobjects[i].transform.model_transform[1][3]); y value
        }
    }
}



