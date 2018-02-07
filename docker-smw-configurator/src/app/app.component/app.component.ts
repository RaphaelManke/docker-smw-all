import {Component, OnInit} from '@angular/core';
import 'hammerjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as fileSaver from 'file-saver';
import {extensions_installer, extensions_core, extensions_smw, skins} from '../data';
import * as JSZip from 'jszip';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private url = '//raw.githubusercontent.com/RaphaelManke/docker-semantic-mediawiki-stack/master/docker-compose.yml';
  private config: string;

  private visible = false;
  private extensions_file = '';

  title = 'app';

  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;


  protected extensions_installer = extensions_installer;
  protected extensions_core = extensions_core;
  protected extensions_smw = extensions_smw;
  protected skins = skins;

  constructor(private formBuilder: FormBuilder,
              private http: HttpClient) {  }

  ngOnInit() {
    this.firstFormGroup = this.formBuilder.group({
      extension_installer: [''],
      extension_core: [''],
      extension_user: ['']
    });
    this.secondFormGroup = this.formBuilder.group({
      extension_smw: [''],
      extension_user_smw: ['']
    });
    this.thirdFormGroup = this.formBuilder.group({
      skin: ['', [Validators.required, Validators.maxLength(1)]]
    });
    this.fourthFormGroup = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      smw_instance_name: ['', Validators.required],
      username_database: [''],
      password_database: [''],
      name_database: ['']
    });
  }

  private generateConfig(extensions, env) {
    let zip = new JSZip();

    return this.http.get(this.url, {responseType: 'text'})
      .subscribe(data => {
        this.config = data;
        zip.file('docker-compose.yml', data);
        zip.file('extensions.json', extensions);
        zip.file('.env', env);
        zip.folder('docker-entrypoint-intitdb.d');
        zip.generateAsync({type: 'blob'})
          .then(function (content) {
            fileSaver.saveAs(content, 'smw_confinguration.zip');
          });
      });
  }

  private changeVisible(): void {
    this.visible = !this.visible;
  }

  private submit(): void {
    let database = '';
    const user = '\nSMW_ADMIN_USER=' + this.fourthFormGroup.value.username + '\nSMW_ADMIN_PASSWORD=' + this.fourthFormGroup.value.password;
    let env = 'DATABASE_NAME=my_wiki _2\nDATABASE_USER=wikiuser\nDATABASE_PASSWORD=example-password';

    if (this.fourthFormGroup.value.username_database === '' || this.fourthFormGroup.value.password_database === '') {
      const password = this.generateUserPW();
      database = '\nDATABASE_PASSWORD=' + password + '\nSMW_DATABASE_USER=' + password + '\nSMW_DATABASE_PASSWORD=' + this.generateUserPW();
    } else {
      database = '\nDATABASE_PASSWORD=' + this.fourthFormGroup.value.password_database + '\nSMW_DATABASE_USER='
        + this.fourthFormGroup.value.username_database + '\nSMW_DATABASE_PASSWORD=' + this.fourthFormGroup.value.password_database;
    }

    env += user + database + '\nSMW_INSTANCE_NAME=' + this.fourthFormGroup.value.smw_instance_name + '\nSMW_LANGUAGE=de';

    this.submitHelper(this.firstFormGroup.value.extension_installer);
    this.submitHelper(this.firstFormGroup.value.extension_core);
    this.submitHelper(this.firstFormGroup.value.extension_user.split(','));
    this.submitHelper(this.secondFormGroup.value.extension_smw);
    this.submitHelper(this.secondFormGroup.value.extension_user_smw.split(','));

    const skin = '"skins" : [\n { \n "name" : "' + this.thirdFormGroup.value.skin + '",' +
      '\n "url" : "https://github.com/wikimedia/mediawiki-skins-' + this.thirdFormGroup.value.skin + '",' +
      '\n "help" : "https://www.mediawiki.org/wiki/Skin:' + this.thirdFormGroup.value.skin +
      '",\n "default" : 1\n}\n]';

    const all_extensions = '{\n "extensions" : [' + this.extensions_file.substring(0, this.extensions_file.length - 1) + '\n],\n' + skin + '\n}';

    this.generateConfig(all_extensions, env);
  }

  private submitHelper(extensions: string []): void {
    let result = '';

    for (let i of extensions) {
      i = i.trim();
      i = i.replace(/ +/g, '');

      if (i.length > 0) {
        result += '\n{\n "name" : "' + i + '",\n "url" : "https://github.com/wikimedia/mediawiki-extensions-' + i + '.git",\n "help" : "https://www.mediawiki.org/wiki/Extension:' + i + '"\n },';
      }
    }
    this.extensions_file += result;
  }

  private generateUserPW(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz!@#$%^&*() _-+<>ABCDEFGHIJKLMNOP1234567890';
    const length = 15;
    let result = '';

    for (let x = 0; x < length; x++) {
      let i = Math.floor(Math.random() * chars.length);
      result += chars.charAt(i);
    }
    return result;
  }
}
