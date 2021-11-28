import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        super();
        this.hover = this.swarm = false;
        this.bgm = new Audio();
        this.bgm.src = 'assets/battle.mp3';
        this.arrow_shot = new Audio();
        this.arrow_shot.src = 'assets/bow_shoot.mp3';
        this.hit = new Audio();
        this.hit.src = 'assets/hitmarker.mp3';
        this.victory = new Audio();
        this.victory.src = 'assets/victory!.mp3';
        this.fail = new Audio();
        this.fail.src = 'assets/fail.mp3';


        this.shapes = {
            'sky': new defs.Subdivision_Sphere(4),
            'ground': new defs.Cube(),
            'sun': new defs.Subdivision_Sphere(4), // declare shapes
            'bow': new Bow(),
            'drawn_bow': new Drawn_Bow(),
            'arrow': new Arrow(),
            'target': new Target(),
            'board': new Board(),
            'fire': new Emitter(),
            'fire_particle': new Particle()
        };

        // *** Materials
        this.materials = {
            sun: new Material(new defs.Phong_Shader(), // declare materials
                {ambient: 1.0}),
            arrow: new Material(new defs.Phong_Shader(),
                {ambient: .05, diffusivity: .8, color: hex_color('#deb887')}),
            bow: new Material(new defs.Phong_Shader(),
                {ambient: .05, diffusivity: .8, color: hex_color('#fff8dc')}),
            target: new Material(new Target_Shader(),
                {ambient: .05, diffusivity: .8, specularity: 1, diffusivity: 0.8}),
            board: new Material(new defs.Phong_Shader(),
                {ambient: .3, diffusivity: .8, color: hex_color('#fff8dc')}),
            sky_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: .85, diffusivity: 0.9, specularity: 0.1,
                texture: new Texture("assets/sky.png", "LINEAR_MIPMAP_LINEAR")
            }),
            night_sky_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: .5, diffusivity: 0.9, specularity: 0.1,
                texture: new Texture("assets/starry.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            ground: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: .5, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/grass.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            fire_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: .5, diffusivity: 1, specularity: 1,
                texture: new Texture("assets/Fire.gif", "LINEAR_MIPMAP_LINEAR")
            }),

        };
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
        this.sky = true;
        this.sun_coef = Math.PI * (0.03);

        this.particles = new Array();
        for(let i = 0; i < 30; i++) {
            this.particles.push(new Particle(Mat4.identity(), 0.0, false));
        }
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
            Math.PI / 4, context.width / context.height, 1, 1000);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1)];
    }
}

export class FinalProject extends Base_Scene {

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("music!", ["m"], () => {this.bgm.play();} );
        this.key_triggered_button("shoot", ["c"], () => {this.arrow_shot.play();} );
        this.key_triggered_button("hit", ["j"], () => {this.hit.play();} );
        this.key_triggered_button("victory", ["k"], () => {this.victory.play();} );
        this.key_triggered_button("fail", ["l"], () => {this.fail.play();} );

    }

    
    display(context, program_state) {
        super.display(context, program_state);
        const blue = hex_color("#1a9ffa");
        
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        // Example for drawing a cube, you can remove this line if needed
        // this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color:blue}));
        let period = (2 * Math.PI) / this.sun_coef;
        if(t % (period) < period/2) {
            this.sky = true;
        }
        else
            this.sky = false;
            
        // sky
        let sky_transform = Mat4.identity();
        sky_transform = sky_transform.times(Mat4.scale(500, 500, 500));
        if(this.sky)
            this.shapes.sky.draw(context, program_state, sky_transform, this.materials.sky_texture);
        else 
            this.shapes.sky.draw(context, program_state, sky_transform, this.materials.night_sky_texture);

        // ground
        let ground_transform = Mat4.identity();
        ground_transform = ground_transform.times(Mat4.scale(500, 1, 500))
            .times(Mat4.translation(0, 0, 0));
        this.shapes.ground.draw(context, program_state, ground_transform, this.materials.ground);
        
        // sun
        let sun_transform = Mat4.identity();
        sun_transform = sun_transform.times(Mat4.rotation(this.sun_coef * t, 1, 0, 0))
               .times(Mat4.translation(0, 0, -250));
        
        let sun_color = vec4(1, 1, 1, 1);
        let sun_material = this.materials.sun;
        sun_material = sun_material.override({color:sun_color});
        if(this.sky) {
            program_state.lights =  [new Light(sun_transform.transposed()[3], color(1, 1, 1, 1), 10 ** 10)];
            this.shapes.sun.draw(context, program_state, sun_transform, sun_material);
        }

        // moon
        let moon_transform = Mat4.identity();
        moon_transform = moon_transform.times(Mat4.rotation(this.sun_coef * t, 1, 0, 0))
               .times(Mat4.translation(0, 0, 250));
        let moon_color = vec4(1, 1, 1, 1);
        let moon_material = this.materials.sun;
        moon_material = moon_material.override({color:moon_color});

        if(!this.sky) {
            program_state.lights =  [new Light(moon_transform.transposed()[3], color(1, 1, 1, 1), 10 ** 3)];
            this.shapes.sun.draw(context, program_state, moon_transform, moon_material);
        }

        // bow
        let bow_transform = Mat4.identity();
        bow_transform = bow_transform.times(Mat4.translation(5, 30, 0));
        this.shapes.bow.draw(context, program_state, bow_transform, this.materials.bow);

        // move
        let arrow_transform = Mat4.identity();
        arrow_transform = arrow_transform.times(Mat4.translation(5 * t, 30, 0));
      
        // arrow   
        this.shapes.arrow.draw(context, program_state, arrow_transform, this.materials.arrow);

        // target
        let target_transform = Mat4.identity();
        target_transform = target_transform.times(Mat4.rotation(Math.PI/2, 0, 1, 0))
            .times(Mat4.translation(0, 30, 100));
        this.shapes.target.draw(context, program_state, target_transform, this.materials.target);

        // fire
        let fire_transform = Mat4.identity();
        fire_transform = fire_transform.times(Mat4.translation(t, 10, 0));
        this.shapes.fire.draw(context, program_state, fire_transform, this.materials.fire_texture);

        
        for(let i = 0; i < 30; i++) {
            if(this.particles[i].init == false) {
                this.particles[i].init = true;
                this.particles[i].transformation = fire_transform;
            }
            else {
                if(t > this.particles[i].end_time) {
                    this.particles.splice(i, 1);
                    this.particles.push(new Particle(fire_transform, t, true))
                }
                this.particles[i].transformation = this.particles[i].transformation.times(Mat4.translation(this.particles[i].vel_x * dt, (Math.random() + 3 + 3) * dt, this.particles[i].vel_z * dt));
                this.shapes.fire_particle.draw(context, program_state, this.particles[i].transformation, this.materials.fire_texture);
            }
        }


    }
}

// sub component for bow
class Sticks extends Shape {
    constructor(length) {
        super("position", "normal", "texture_coord");
        let stick_transform = Mat4.identity();
        stick_transform = stick_transform.times(Mat4.scale(0.1, length, 0.5));
        defs.Cube.insert_transformed_copy_into(this, [], stick_transform);
    }

}

// bow object class
class Bow extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");
        // upper
        let upper_bow_transform = Mat4.identity();
        Sticks.insert_transformed_copy_into(this, [5], upper_bow_transform);
        upper_bow_transform = upper_bow_transform.times(Mat4.rotation(Math.PI/8, 0, 0, 1))//
            .times(Mat4.translation(1.89, 9.5, 0));
        Sticks.insert_transformed_copy_into(this, [5], upper_bow_transform);
        upper_bow_transform = upper_bow_transform.times(Mat4.rotation(Math.PI/8, 0, 0, 1))//
            .times(Mat4.translation(1.89, 9.5, 0));
        Sticks.insert_transformed_copy_into(this, [5], upper_bow_transform);

        // lower
        let lower_bow_transform = Mat4.identity();
        Sticks.insert_transformed_copy_into(this, [5], lower_bow_transform);
        lower_bow_transform = lower_bow_transform.times(Mat4.rotation(-Math.PI/8, 0, 0, 1))//
            .times(Mat4.translation(1.89, -9.5, 0));
        Sticks.insert_transformed_copy_into(this, [5], lower_bow_transform);
        lower_bow_transform = lower_bow_transform.times(Mat4.rotation(-Math.PI/8, 0, 0, 1))//
            .times(Mat4.translation(1.89, -9.5, 0));
        Sticks.insert_transformed_copy_into(this, [5], lower_bow_transform);

        // string
        let string_transform = Mat4.identity();
        string_transform = string_transform.times(Mat4.scale(.1, 43, .1))
            .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
            .times(Mat4.translation(-100, 0, 0));
        defs.Capped_Cylinder.insert_transformed_copy_into(this, [5, 20, [[0, 5], [0, 20]]], string_transform);
    }
}

class Drawn_Bow extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");
        // upper
        let upper_bow_transform = Mat4.identity();
        Sticks.insert_transformed_copy_into(this, [5], upper_bow_transform);
        upper_bow_transform = upper_bow_transform.times(Mat4.rotation(Math.PI/5, 0, 0, 1))//
            .times(Mat4.translation(3, 9, 0));
        Sticks.insert_transformed_copy_into(this, [5], upper_bow_transform);
        upper_bow_transform = upper_bow_transform.times(Mat4.rotation(Math.PI/5, 0, 0, 1))//
            .times(Mat4.translation(3, 9, 0));
        Sticks.insert_transformed_copy_into(this, [5], upper_bow_transform);

        // lower
        let lower_bow_transform = Mat4.identity();
        Sticks.insert_transformed_copy_into(this, [5], lower_bow_transform);
        lower_bow_transform = lower_bow_transform.times(Mat4.rotation(-Math.PI/5, 0, 0, 1))//
            .times(Mat4.translation(3, -9, 0));
        Sticks.insert_transformed_copy_into(this, [5], lower_bow_transform);
        lower_bow_transform = lower_bow_transform.times(Mat4.rotation(-Math.PI/5, 0, 0, 1))//
            .times(Mat4.translation(3, -9, 0));
        Sticks.insert_transformed_copy_into(this, [5], lower_bow_transform);

        // string
        let string_transform = Mat4.identity();
        string_transform = string_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0))
            .times(Mat4.rotation(-Math.PI/4, 0, 1, 0))
            .times(Mat4.scale(.1, .1, 45/2))
            .times(Mat4.translation(-20 / 0.1, 0 / 0.1, 9.5 / (45/2)));
        defs.Capped_Cylinder.insert_transformed_copy_into(this, [5, 20, [[0, 5], [0, 20]]], string_transform);

        let string2_transform = Mat4.identity();
        string2_transform = string2_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0))
            .times(Mat4.rotation(Math.PI/4, 0, 1, 0))
            .times(Mat4.scale(.1, .1, 45/2))
            .times(Mat4.translation(-20 / 0.1, 0 / 0.1, -9.5 / (45/2)));
        defs.Capped_Cylinder.insert_transformed_copy_into(this, [5, 20, [[0, 5], [0, 20]]], string2_transform);

        //arrow 
        let arrow_transform = Mat4.identity();
        arrow_transform = arrow_transform.times(Mat4.translation(-15, 0, 0));
        Arrow.insert_transformed_copy_into(this, [], arrow_transform);
    }
}

// arrow object class
class Arrow extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");
        // shaft
        let shaft_transform = Mat4.identity();
        shaft_transform = shaft_transform.times(Mat4.rotation(Math.PI/2, 0, 1, 0))
            .times(Mat4.scale(0.3, 0.3, 30.0));
        defs.Capped_Cylinder.insert_transformed_copy_into(this, [5, 20, [[0, 5], [0, 20]]], shaft_transform);
        
        // tip
        let tip_transform = Mat4.identity();
        tip_transform = tip_transform.times(Mat4.rotation(Math.PI/2, 0, 1, 0))
            .times(Mat4.translation(0, 0, 15))
            .times(Mat4.scale(.6, .6, .6));
        defs.Closed_Cone.insert_transformed_copy_into(this, [5, 20, [[0, 5], [0, 20]]], tip_transform);

        // fletching
        let fletching_transform = Mat4.identity();
        fletching_transform = fletching_transform.times(Mat4.translation(-15, 0, 0))
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

//board object class
class Board extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");
        let board_transform = Mat4.identity();
        board_transform = board_transform.times(Mat4.scale(2, 2, 0.1));
        defs.Cube.insert_transformed_copy_into(this, [], board_transform);
    }

}

class Particle extends Shape {
    constructor(transformation, init_time, init) {
        super("position", "normal", "texture_coord");
        this.transformation = transformation;
        this.init_time = init_time;
        this.end_time = init_time + (Math.random() * 3 + 1);
        this.init = init;
        this.vel_x = Math.random() * 4 - 2;
        this.vel_z = Math.random() * 4 - 2;

        let shrink = Mat4.identity();
        shrink = shrink.times(Mat4.scale(0.2, 0.2, 0.2));
        defs.Subdivision_Sphere.insert_transformed_copy_into(this, [4], shrink);
    }
}

// fire emitter
class Emitter extends Shape {
     constructor() {
        super("position", "normal", "texture_coord");
        let emitter_transform = Mat4.identity();
        //emitter_transform = emitter_transform.times(Mat4.scale(2, 2, 0.1));
        defs.Cube.insert_transformed_copy_into(this, [4], emitter_transform);

    }
}

//target object class
class Target extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");
        let target_transform = Mat4.identity();
        target_transform = target_transform.times(Mat4.scale(20,20,1.1));
        defs.Capped_Cylinder.insert_transformed_copy_into(this, [5, 20, [[0, 5], [0, 20]]], target_transform);
    }
}

// shaders for target object
class Target_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        const float max_dist = 20.0;

        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;
        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace, vec4 input_color ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );
                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                

                vec3 light_contribution = (input_color.xyz/ambient) * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        }
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position, normal;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
          // The vertex's final resting place (in NDCS):
          gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
          // The final normal vector in screen space.
          N = normalize( mat3( model_transform ) * normal / squared_scale);
          vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
          center = vec4(0.0, 0.0, 0.0, 1.0);
          point_position = vec4(position, 1.0);
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        void main(){
            float dist = distance(point_position, center);
            float ratio = dist/max_dist;
            // gold
            if(ratio > 0.095 && ratio < 0.105) // these type lines are to just make the middle separation line
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // actual color
            else if(ratio < 0.2)
                gl_FragColor = vec4(0.83, 0.68, 0.21, 1.0);
            // red
            else if(ratio > 0.295 && ratio < 0.305)
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            else if (ratio < 0.4)
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            // blue
            else if(ratio > 0.495 && ratio < 0.505)
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            else if (ratio < 0.6)
                gl_FragColor = vec4(0.2, 0.7, 1.0, 1.0);
            // black
            else if(ratio > 0.695 && ratio < 0.705)
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            else if (ratio < 0.8)
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            // white
            else if(ratio > 0.895 && ratio < 0.905)
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            else
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            gl_FragColor.xyz *= ambient;

            // Compute the final color with contributions from lights:
            gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace, gl_FragColor);
            
        }`;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(.5, .5, .5, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Particles extends Shader {
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

        typedef point4 vec4;
        typedef struct particle
        {
            int color;
            point4 position;
            vec4 velocity;
            float mass;
        } particle;
        
        particle particles[10];
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
            layout (location = 0) in vec4 vertex; // <vec2 position, vec2 texCoords>

            out vec2 TexCoords;
            out vec4 ParticleColor;

            uniform mat4 projection;
            uniform vec2 offset;
            uniform vec4 color;

            void main()
            {
                float scale = 10.0f;
                TexCoords = vertex.zw;
                ParticleColor = color;
                gl_Position = projection * vec4((vertex.xy * scale) + offset, 0.0, 1.0);
            }
        `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
            in vec2 TexCoords;
            in vec4 ParticleColor;
            out vec4 color;

            uniform sampler2D sprite;

            void main()
            {
                color = (texture(sprite, TexCoords) * ParticleColor);
            } 
        `;
    }
}