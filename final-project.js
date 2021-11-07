import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
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
            'sun': new defs.Subdivision_Sphere(4),
            'bow': new Bow(),
            'arrow': new Arrow(),
            'target': new Target(),
        };

        // *** Materials
        this.materials = {
            sun: new Material(new defs.Phong_Shader(),
                {ambient: 1.0}),
            arrow: new Material(new defs.Phong_Shader(),
                {ambient: .3, diffusivity: .8, color: hex_color('#deb887')}),
            bow: new Material(new defs.Phong_Shader(),
                {ambient: .3, diffusivity: .8, color: hex_color('#fff8dc')}),
            target: new Material(new Target_Shader())
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
        
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        // Example for drawing a cube, you can remove this line if needed
        // this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color:blue}));

        // sun
        let sun_transform = Mat4.identity();
        let a = 2;
        let b = 1;
        let w = (1/5) * Math.PI; 
        let sun_radius = a + b*Math.sin(w*t);
        let color_gradient = 0.5 + 0.5*Math.sin(w * t)
        let sun_color = vec4(1, color_gradient, color_gradient, 1);
        sun_transform = sun_transform.times(Mat4.scale(sun_radius, sun_radius, sun_radius));
        program_state.lights =  [new Light(vec4(0, 0, 0, 1), color(1, color_gradient, color_gradient, 1), 10 ** sun_radius)];
        let sun_material = this.materials.sun;
        sun_material = sun_material.override({color:sun_color});
        this.shapes.sun.draw(context, program_state, sun_transform, sun_material);

        // bow
        let bow_transform = Mat4.identity();
        bow_transform = bow_transform.times(Mat4.translation(5, 0, -10));
        this.shapes.bow.draw(context, program_state, bow_transform, this.materials.bow);

        // move
        let arrow_transform = Mat4.identity();
        arrow_transform = arrow_transform.times(Mat4.translation(t, 0, -10));
      
        // arrow   
        this.shapes.arrow.draw(context, program_state, arrow_transform, this.materials.arrow);

        // target
        let target_transform = Mat4.identity();
        target_transform = target_transform.times(Mat4.translation(0, 0, -20));
        this.shapes.target.draw(context, program_state, target_transform, this.materials.target);


    }
}

class Sticks extends Shape {
    constructor(length) {
        super("position", "normal", "texture_coord");
        let stick_transform = Mat4.identity();
        stick_transform = stick_transform.times(Mat4.scale(0.1, length, 0.5));
        defs.Cube.insert_transformed_copy_into(this, [], stick_transform);
    }

}
class Bow extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");
        // upper
        let upper_bow_transform = Mat4.identity();
        Sticks.insert_transformed_copy_into(this, [5], upper_bow_transform);
        upper_bow_transform = upper_bow_transform.times(Mat4.rotation(Math.PI/8, 0, 0, 1))//
            .times(Mat4.translation(1.9, 9.5, 0));
        Sticks.insert_transformed_copy_into(this, [5], upper_bow_transform);
        upper_bow_transform = upper_bow_transform.times(Mat4.rotation(Math.PI/8, 0, 0, 1))//
            .times(Mat4.translation(1.9, 9.5, 0));
        Sticks.insert_transformed_copy_into(this, [5], upper_bow_transform);

        // lower
        let lower_bow_transform = Mat4.identity();
        Sticks.insert_transformed_copy_into(this, [5], lower_bow_transform);
        lower_bow_transform = lower_bow_transform.times(Mat4.rotation(-Math.PI/8, 0, 0, 1))//
            .times(Mat4.translation(1.9, -9.5, 0));
        Sticks.insert_transformed_copy_into(this, [5], lower_bow_transform);
        lower_bow_transform = lower_bow_transform.times(Mat4.rotation(-Math.PI/8, 0, 0, 1))//
            .times(Mat4.translation(1.9, -9.5, 0));
        Sticks.insert_transformed_copy_into(this, [5], lower_bow_transform);

        // string
        let string_transform = Mat4.identity();
        string_transform = string_transform.times(Mat4.scale(.1, 43, .1))
            .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
            .times(Mat4.translation(-100, 0, 0));
        defs.Capped_Cylinder.insert_transformed_copy_into(this, [5, 20, [[0, 5], [0, 20]]], string_transform);
    }
}
class Arrow extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");
        // shaft
        let shaft_transform = Mat4.identity();
        shaft_transform = shaft_transform.times(Mat4.rotation(Math.PI/2, 0, 1, 0))
            .times(Mat4.scale(0.3, 0.3, 20.0));
        defs.Capped_Cylinder.insert_transformed_copy_into(this, [5, 20, [[0, 5], [0, 20]]], shaft_transform);
        
        // tip
        let tip_transform = Mat4.identity();
        tip_transform = tip_transform.times(Mat4.rotation(Math.PI/2, 0, 1, 0))
            .times(Mat4.translation(0, 0, 10))
            .times(Mat4.scale(.6, .6, .6));
        defs.Closed_Cone.insert_transformed_copy_into(this, [5, 20, [[0, 5], [0, 20]]], tip_transform);

        // fletching
        let fletching_transform = Mat4.identity();
        fletching_transform = fletching_transform.times(Mat4.translation(-10, 0, 0))
            .times(Mat4.scale(2, 2, 2));
        defs.Triangle.insert_transformed_copy_into(this, [], fletching_transform);

        fletching_transform = fletching_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0));
        defs.Triangle.insert_transformed_copy_into(this, [], fletching_transform);

        fletching_transform = fletching_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0));
        defs.Triangle.insert_transformed_copy_into(this, [], fletching_transform);

        fletching_transform = fletching_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0));
        defs.Triangle.insert_transformed_copy_into(this, [], fletching_transform);


    }
}

class Target extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");
        let target_transform = Mat4.identity();
        target_transform = target_transform.times(Mat4.scale(15,15,0));
        defs.Regular_2D_Polygon.insert_transformed_copy_into(this, [20, 20], target_transform);
    }
}

class Target_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
        //this.send_material(context, gpu_addresses, material);
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        const float max_dist = 15.0;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
          gl_Position = projection_camera_model_transform * vec4(position, 1.0);
          center = vec4(0.0, 0.0, 0.0, 1.0);
          point_position = vec4(position, 1.0);
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        void main(){
            //float gradient = sin(1.6 * distance(point_position, center));
            float dist = distance(point_position, center);
            float ratio = dist/max_dist;
            if(ratio < 0.2)
                gl_FragColor = vec4(0.83, 0.68, 0.21, 1.0);
            else if (ratio < 0.4)
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            else if (ratio < 0.6)
                gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
            else if (ratio < 0.8)
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            else
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }`;
    }
}
