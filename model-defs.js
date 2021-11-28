import {defs, tiny} from '../examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene, Shader
} = tiny;


const model_defs = {};

export {model_defs};

const Particle = model_defs.Particle = 
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
const Emitter = model_defs.Emitter = 
    class Emitter extends Shape {
         constructor() {
            super("position", "normal", "texture_coord");
            let emitter_transform = Mat4.identity();
            //emitter_transform = emitter_transform.times(Mat4.scale(2, 2, 0.1));
            defs.Cube.insert_transformed_copy_into(this, [4], emitter_transform);

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
const Bow = model_defs.Bow =
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

const Drawn_Bow = model_defs.Drawn_Bow =	
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
const Arrow = model_defs.Arrow = 
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
const Board = model_defs.Board =	
    class Board extends Shape {
        constructor() {
            super("position", "normal", "texture_coord");
            let board_transform = Mat4.identity();
            board_transform = board_transform.times(Mat4.scale(2, 2, 0.1));
            defs.Cube.insert_transformed_copy_into(this, [], board_transform);
        }

    }

//ouline object class
const Cube_Outline = model_defs.Cube_Outline =
    class Cube_Outline extends Shape {
        constructor() {
            super("position", "color");
            //  TODO (Requirement 5).
            // When a set of lines is used in graphics, you should think of the list entries as
            // broken down into pairs; each pair of vertices will be drawn as a line segment.
            // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
            this.arrays.position = Vector3.cast(
                [-1, 1, 1], [-1, 1, -1], 
                [-1, 1, -1], [1, 1, -1], 
                [1, 1, -1], [1, 1, 1], 
                [1, 1, 1], [-1, 1, 1],
                [-1, -1, -1], [1, -1, -1], 
                [1, -1, -1], [1, -1, 1], 
                [1, -1, 1], [-1, -1, 1], 
                [-1, -1, 1], [-1, -1, -1],                        
                [-1, 1, -1], [-1, -1, -1], 
                [-1, 1, 1], [-1, -1, 1], 
                [1, 1, 1], [1, -1, 1], 
                [1, 1, -1], [1, -1, -1]
                );
            this.arrays.color = [
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
                vec4(1, 1, 1, 1), vec4(1, 1, 1, 1),
            ];
            this.indices = false;
        }
    }
//target object class
const Target = model_defs.Target =
    class Target extends Shape {
        constructor() {
            super("position", "normal", "texture_coord");
            let target_transform = Mat4.identity();
            target_transform = target_transform.times(Mat4.scale(20,20,1.1));
            defs.Capped_Cylinder.insert_transformed_copy_into(this, [5, 20, [[0, 5], [0, 20]]], target_transform);
        }
    }



// shaders for target object
const Target_Shader = model_defs.Target_Shader =
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