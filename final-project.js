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
            'sun': new defs.Subdivision_Sphere(4), // declare shapes
            'bow': new Bow(),
            'arrow': new Arrow(),
            'target': new Target(),
        };

        // *** Materials
        this.materials = {
            sun: new Material(new defs.Phong_Shader(), // declare materials
                {ambient: 1.0}),
            arrow: new Material(new defs.Phong_Shader(),
                {ambient: .3, diffusivity: .8, color: hex_color('#deb887')}),
            bow: new Material(new defs.Phong_Shader(),
                {ambient: .3, diffusivity: .8, color: hex_color('#fff8dc')}),
            target: new Material(new Target_Shader(),
                {ambient: .3, diffusivity: .8})
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
            program_state.set_camera(Mat4.translation(0, 0, -30));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}
const Controls = defs.Movement_Controls =
    class Controls extends Scene {
        // **Movement_Controls** is a Scene that can be attached to a canvas, like any other
        // Scene, but it is a Secondary Scene Component -- meant to stack alongside other
        // scenes.  Rather than drawing anything it embeds both first-person and third-
        // person style controls into the website.  These can be used to manually move your
        // camera or other objects smoothly through your scene using key, mouse, and HTML
        // button controls to help you explore what's in it.
        constructor() {
            super();
            const data_members = {
                roll: 0, look_around_locked: true,
                thrust: vec3(0, 0, 0), pos: vec3(0, 0, 0), z_axis: vec3(0, 0, 0),
                radians_per_frame: 1 / 200, meters_per_frame: 20, speed_multiplier: 1
            };
            Object.assign(this, data_members);

            this.mouse_enabled_canvases = new Set();
            this.will_take_over_graphics_state = true;
        }

        set_recipient(matrix_closure, inverse_closure) {
            // set_recipient(): The camera matrix is not actually stored here inside Movement_Controls;
            // instead, track an external target matrix to modify.  Targets must be pointer references
            // made using closures.
            this.matrix = matrix_closure;
            this.inverse = inverse_closure;
        }

        reset(graphics_state) {
            // reset(): Initially, the default target is the camera matrix that Shaders use, stored in the
            // encountered program_state object.  Targets must be pointer references made using closures.
            this.set_recipient(() => graphics_state.camera_transform,
                () => graphics_state.camera_inverse);
        }

        add_mouse_controls(canvas) {
            // add_mouse_controls():  Attach HTML mouse events to the drawing canvas.
            // First, measure mouse steering, for rotating the flyaround camera:
            this.mouse = {"from_center": vec(0, 0)};
            const mouse_position = (e, rect = canvas.getBoundingClientRect()) =>
                vec(e.clientX - (rect.left + rect.right) / 2, e.clientY - (rect.bottom + rect.top) / 2);
            // Set up mouse response.  The last one stops us from reacting if the mouse leaves the canvas:
            document.addEventListener("mouseup", e => {
                this.mouse.anchor = undefined;
            });
            canvas.addEventListener("mousedown", e => {
                e.preventDefault();
                this.mouse.anchor = mouse_position(e);
            });
            canvas.addEventListener("mousemove", e => {
                e.preventDefault();
                this.mouse.from_center = mouse_position(e);
            });
            canvas.addEventListener("mouseout", e => {
                if (!this.mouse.anchor) this.mouse.from_center.scale_by(0)
            });
        }

        show_explanation(document_element) {
        }

       make_control_panel() {
            // make_control_panel(): Sets up a panel of interactive HTML elements, including
            // buttons with key bindings for affecting this scene, and live info readouts.
            this.control_panel.innerHTML += "Click and drag the scene to spin your viewpoint around it.<br>";
            this.live_string(box => box.textContent = "- Position: " + this.pos[0].toFixed(2) + ", " + this.pos[1].toFixed(2)
                + ", " + this.pos[2].toFixed(2));
            this.new_line();
            // The facing directions are surprisingly affected by the left hand rule:
            this.live_string(box => box.textContent = "- Facing: " + ((this.z_axis[0] > 0 ? "West " : "East ")
                + (this.z_axis[1] > 0 ? "Down " : "Up ") + (this.z_axis[2] > 0 ? "North" : "South")));
            //this.new_line();
            //this.new_line();
            this.new_line();
            const dir = this.control_panel.appendChild(document.createElement("span"));
            dir.style.margin = "37px";
            this.key_triggered_button("Up", ["w"], () => this.thrust[1] = -1, "#77d777", () => this.thrust[1] = 0);
            this.new_line();
            //this.key_triggered_button("Forward", ["w"], () => this.thrust[2] = 1, undefined, () => this.thrust[2] = 0);a
            this.key_triggered_button("Left", ["a"], () => this.thrust[0] = 1,  "#77d777", () => this.thrust[0] = 0);
            //this.key_triggered_button("Back", ["s"], () => this.thrust[2] = -1, undefined, () => this.thrust[2] = 0);
            this.key_triggered_button("Down", ["s"], () => this.thrust[1] = 1,  "#77d777", () => this.thrust[1] = 0);
            this.key_triggered_button("Right", ["d"], () => this.thrust[0] = -1,  "#77d777", () => this.thrust[0] = 0);
            this.new_line();
            this.new_line();
            const speed_controls = this.control_panel.appendChild(document.createElement("span"));
            //speed_controls.style.margin = "30px";
            this.key_triggered_button("-", ["z"], () =>
                this.speed_multiplier /= 1.2, "#add8e6", undefined, undefined, speed_controls);
            this.live_string(box => {
                box.textContent = "Arrow Power: " + this.speed_multiplier.toFixed(2)
            }, speed_controls);
            this.key_triggered_button("+", ["x"], () =>
                this.speed_multiplier *= 1.2, "#0800f6", undefined, undefined, speed_controls);
                this.new_line();
            const speed_controls2 = this.control_panel.appendChild(document.createElement("span"));
            speed_controls2.style.margin = "5px";
            this.key_triggered_button("Reset Arrow Power:", [" "], () => {
                this.speed_multiplier = 1;
            }, "#ff7f7f");
            //this.key_triggered_button("Roll left", [","], () => this.roll = 1, undefined, () => this.roll = 0);
            //this.key_triggered_button("Roll right", ["."], () => this.roll = -1, undefined, () => this.roll = 0);
            this.new_line();
            this.key_triggered_button("(Un)freeze mouse look around", ["f"], () => this.look_around_locked ^= 1, "#8B8885");
            this.new_line();
            /*this.key_triggered_button("Go to world origin", ["r"], () => {
                this.matrix().set_identity(4, 4);
                this.inverse().set_identity(4, 4)
            }, "#8B8885");*/
            this.new_line();

            this.key_triggered_button("Reset position", ["r"], () => {
                this.inverse().set(Mat4.look_at(vec3(0, 0, 30), vec3(0, 0, 0), vec3(0, 1, 0)));
                this.matrix().set(Mat4.inverse(this.inverse()));
            }, "#8B8885");
            this.new_line();
            /*this.key_triggered_button("from right", ["2"], () => {
                this.inverse().set(Mat4.look_at(vec3(10, 0, 0), vec3(0, 0, 0), vec3(0, 1, 0)));
                this.matrix().set(Mat4.inverse(this.inverse()));
            }, "#8B8885");
            this.key_triggered_button("from rear", ["3"], () => {
                this.inverse().set(Mat4.look_at(vec3(0, 0, -10), vec3(0, 0, 0), vec3(0, 1, 0)));
                this.matrix().set(Mat4.inverse(this.inverse()));
            }, "#8B8885");
            this.key_triggered_button("from left", ["4"], () => {
                this.inverse().set(Mat4.look_at(vec3(-10, 0, 0), vec3(0, 0, 0), vec3(0, 1, 0)));
                this.matrix().set(Mat4.inverse(this.inverse()));
            }, "#8B8885");
            this.new_line();*/
            this.key_triggered_button("SHOOT!", ["Enter"],
                () => {
                    
                }, "#ff0000");
            this.new_line();
            this.key_triggered_button("Attach to global camera", ["Shift", "R"],
                () => {
                    this.will_take_over_graphics_state = true
                }, "#8B8885");
            this.new_line();
        }

        first_person_flyaround(radians_per_frame, meters_per_frame, leeway = 70) {
            // (Internal helper function)
            // Compare mouse's location to all four corners of a dead box:
            const offsets_from_dead_box = {
                plus: [this.mouse.from_center[0] + leeway, this.mouse.from_center[1] + leeway],
                minus: [this.mouse.from_center[0] - leeway, this.mouse.from_center[1] - leeway]
            };
            // Apply a camera rotation movement, but only when the mouse is
            // past a minimum distance (leeway) from the canvas's center:
            if (!this.look_around_locked)
                // If steering, steer according to "mouse_from_center" vector, but don't
                // start increasing until outside a leeway window from the center.
                for (let i = 0; i < 2; i++) {                                     // The &&'s in the next line might zero the vectors out:
                    let o = offsets_from_dead_box,
                        velocity = ((o.minus[i] > 0 && o.minus[i]) || (o.plus[i] < 0 && o.plus[i])) * radians_per_frame;
                    // On X step, rotate around Y axis, and vice versa.
                    this.matrix().post_multiply(Mat4.rotation(-velocity, i, 1 - i, 0));
                    this.inverse().pre_multiply(Mat4.rotation(+velocity, i, 1 - i, 0));
                }
            this.matrix().post_multiply(Mat4.rotation(-.1 * this.roll, 0, 0, 1));
            this.inverse().pre_multiply(Mat4.rotation(+.1 * this.roll, 0, 0, 1));
            // Now apply translation movement of the camera, in the newest local coordinate frame.
            this.matrix().post_multiply(Mat4.translation(...this.thrust.times(-meters_per_frame)));
            this.inverse().pre_multiply(Mat4.translation(...this.thrust.times(+meters_per_frame)));
        }

        third_person_arcball(radians_per_frame) {
            // (Internal helper function)
            // Spin the scene around a point on an axis determined by user mouse drag:
            const dragging_vector = this.mouse.from_center.minus(this.mouse.anchor);
            if (dragging_vector.norm() <= 0)
                return;
            this.matrix().post_multiply(Mat4.translation(0, 0, -25));
            this.inverse().pre_multiply(Mat4.translation(0, 0, +25));

            const rotation = Mat4.rotation(radians_per_frame * dragging_vector.norm(),
                dragging_vector[1], dragging_vector[0], 0);
            this.matrix().post_multiply(rotation);
            this.inverse().pre_multiply(rotation);

            this.matrix().post_multiply(Mat4.translation(0, 0, +25));
            this.inverse().pre_multiply(Mat4.translation(0, 0, -25));
        }

        display(context, graphics_state, dt = graphics_state.animation_delta_time / 1000) {
            // The whole process of acting upon controls begins here.
            const m = this.speed_multiplier * this.meters_per_frame,
                r = this.speed_multiplier * this.radians_per_frame;

            if (this.will_take_over_graphics_state) {
                this.reset(graphics_state);
                this.will_take_over_graphics_state = false;
            }

            if (!this.mouse_enabled_canvases.has(context.canvas)) {
                this.add_mouse_controls(context.canvas);
                this.mouse_enabled_canvases.add(context.canvas)
            }
            // Move in first-person.  Scale the normal camera aiming speed by dt for smoothness:
            this.first_person_flyaround(dt * r, dt * m);
            // Also apply third-person "arcball" camera mode if a mouse drag is occurring:
            if (this.mouse.anchor)
                this.third_person_arcball(dt * r);
            // Log some values:
            this.pos = this.inverse().times(vec4(0, 0, 0, 1));
            this.z_axis = this.inverse().times(vec4(0, 0, 1, 0));
        }
    }


export class FinalProject extends Base_Scene {

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change Colors", ["c"], this.set_colors);
        this.key_triggered_button("Spawn Arrow", ["v"], () => {           
                }, "#ff0000");
    }

    
    display(context, program_state) {
        super.display(context, program_state);
        const blue = hex_color("#1a9ffa");
        
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        // Example for drawing a cube, you can remove this line if needed
        // this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color:blue}));

        // sun
        let sun_transform = Mat4.identity();
        let a = 3;
        let b = 1.5;
        let w = (1/3) * Math.PI; 
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
        target_transform = target_transform.times(Mat4.rotation(Math.PI/2, 0, 1, 0))
            .times(Mat4.translation(10, 0, 50));
        this.shapes.target.draw(context, program_state, target_transform, this.materials.target);


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

// arrow object class
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
